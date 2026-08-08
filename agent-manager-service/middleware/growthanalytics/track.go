// Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// Package growthanalytics reports feature-usage telemetry for the SaaS
// deployment of agent-manager-service to Moesif, per the Product Feature
// Usage Tracking taxonomy (see samples/products/agent-manager/taxonomy.yaml
// in the Feature Usage Tracking initiative docs).
package growthanalytics

import (
	"context"
	"net/http"
	"sync"

	moesifmiddleware "github.com/moesif/moesifmiddleware-go"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
)

type ctxKey int

const (
	featureCodeKey ctxKey = iota
	targetHandlerKey
)

// moesifmiddleware-go keeps its client and its entire options map (including
// the Get_Metadata/Identify_User/Identify_Company callbacks) in package-level
// globals: the first call to MoesifMiddleware wins, and every later call is a
// no-op that silently keeps reusing the first call's callbacks. Track is
// called once per route with a distinct feature code, so wrapping each route
// in its own MoesifMiddleware call — the obvious approach — would make every
// route report the first-registered route's feature code. Instead, wrap the
// SDK exactly once (via initOnce) around a dispatcher that reads the feature
// code and the real handler out of the request context, which Track sets
// per-request before delegating to the shared wrapped handler.
var (
	initOnce      sync.Once
	sharedWrapped http.Handler
)

// Track wraps handler so successful calls to it are reported to Moesif as
// the given feature-taxonomy event name (e.g.
// "amp.agent-development.create-agent"). It is a no-op — returns handler
// unchanged — unless this is a SaaS deployment with a Moesif Application ID
// configured (IsOnPremDeployment is false and GrowthAnalytics.MoesifApplicationID
// is set), so the OSS/on-prem build never emits telemetry.
//
// Request and response bodies are never forwarded to Moesif: many of the
// routes this wraps return generated secrets (API keys, tokens, identity
// secrets) in the response body.
func Track(featureCode string, handler http.HandlerFunc) http.HandlerFunc {
	cfg := config.GetConfig()
	if cfg.IsOnPremDeployment || cfg.GrowthAnalytics.MoesifApplicationID == "" {
		return handler
	}

	initOnce.Do(func() {
		options := map[string]interface{}{
			"Application_Id": cfg.GrowthAnalytics.MoesifApplicationID,
			"Log_Body":       false,
			"Identify_User": func(req *http.Request, _ moesifmiddleware.MoesifResponseRecorder) string {
				claims := jwtassertion.GetTokenClaims(req.Context())
				if claims == nil {
					return ""
				}
				return claims.Sub
			},
			"Identify_Company": func(req *http.Request, _ moesifmiddleware.MoesifResponseRecorder) string {
				return middleware.OUIDFromRequest(req)
			},
			"Get_Metadata": func(req *http.Request, _ moesifmiddleware.MoesifResponseRecorder) map[string]interface{} {
				fc, _ := req.Context().Value(featureCodeKey).(string)
				return map[string]interface{}{
					"growth_action":    fc,
					"product_version":  config.GetConfig().PackageVersion,
					"deployment_model": "saas",
				}
			},
		}
		sharedWrapped = moesifmiddleware.MoesifMiddleware(http.HandlerFunc(dispatch), options)
	})

	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), featureCodeKey, featureCode)
		ctx = context.WithValue(ctx, targetHandlerKey, handler)
		sharedWrapped.ServeHTTP(w, r.WithContext(ctx))
	}
}

// dispatch is the single handler every route is funneled through once
// wrapped by Moesif; it looks up which real handler to run for this request
// from the context Track populated.
func dispatch(w http.ResponseWriter, r *http.Request) {
	if h, ok := r.Context().Value(targetHandlerKey).(http.HandlerFunc); ok {
		h(w, r)
	}
}
