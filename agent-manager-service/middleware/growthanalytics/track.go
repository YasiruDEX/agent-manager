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
// in the Feature Usage Tracking initiative docs). It currently instruments
// the "Agent Development" feature category only.
//
// Tracking is always fire-and-forget: it must never change a request's
// outcome or add observable latency to it. Two things make that true —
//  1. the Moesif SDK itself queues events into an in-memory batch and
//     flushes them on a background timer, never blocking the calling
//     goroutine;
//  2. every call into the SDK (client init and the per-request hook) runs
//     under a recover(), so a bad Application ID, a client-library bug, or
//     any other Moesif-side failure surfaces as a log line, never a 5xx.
package growthanalytics

import (
	"context"
	"log/slog"
	"net/http"
	"sync"

	moesifmiddleware "github.com/moesif/moesifmiddleware-go"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/logger"
)

type ctxKey int

const (
	featureCodeKey ctxKey = iota
	dimensionsKey
	targetHandlerKey
	statusHolderKey
)

// DynamicOutcome is a sentinel value: pass it under the "outcome" key in
// Track's dimensions to have the actual outcome ("success"/"failure")
// computed from the wrapped handler's real response status instead of a
// fixed value supplied up front.
var DynamicOutcome = struct{ dynamicOutcome bool }{true}

// moesifWrap is moesifmiddleware.MoesifMiddleware behind a package var so
// tests can substitute a fake in place of the real SDK without ever making a
// network call.
var moesifWrap = moesifmiddleware.MoesifMiddleware

// moesifmiddleware-go keeps its client and its entire options map (including
// the Get_Metadata/Identify_User/Identify_Company callbacks) in package-level
// globals inside the SDK: the first call to MoesifMiddleware wins, and every
// later call is a no-op that silently keeps reusing the first call's
// callbacks. Track is called once per route with a distinct feature code, so
// wrapping each route in its own MoesifMiddleware call — the obvious
// approach — would make every route report the first-registered route's
// feature code. Instead, wrap the SDK exactly once (via initOnce) around a
// dispatcher that reads the feature code, dimensions, and the real handler
// out of the request context, which Track sets per-request before
// delegating to the shared wrapped handler.
var (
	initOnce      sync.Once
	sharedWrapped http.Handler
)

// statusHolder carries the wrapped handler's real response status from
// dispatch (where it's observed) to Get_Metadata (where "outcome" is
// resolved). Moesif's own MoesifResponseRecorder tracks status internally
// but exposes no accessor, so dimensions that depend on the response
// (currently just "outcome") have to be captured this way instead.
type statusHolder struct{ code int }

type statusRecordingWriter struct {
	http.ResponseWriter
	holder      *statusHolder
	wroteHeader bool
}

func (s *statusRecordingWriter) WriteHeader(code int) {
	if !s.wroteHeader {
		s.holder.code = code
		s.wroteHeader = true
	}
	s.ResponseWriter.WriteHeader(code)
}

// Track wraps handler so calls to it are reported to Moesif as the given
// feature-taxonomy event name (e.g. "amp.agent-development.create-agent"),
// enriched with the given dimensions — the taxonomy's per-feature dimension
// values. Most dimensions are fixed for a given route (e.g. update_target)
// and can be passed as plain values; pass DynamicOutcome under the
// "outcome" key to have it computed from the handler's real response status
// instead. Pass nil when a feature has no dimensions.
//
// Track is a no-op — returns handler unchanged — unless this is a SaaS
// deployment with a Moesif Application ID configured (IsOnPremDeployment is
// false and GrowthAnalytics.MoesifApplicationID is set), so the OSS/on-prem
// build never emits telemetry.
//
// Request and response bodies are never forwarded to Moesif: several of the
// routes this wraps return generated secrets (API keys, tokens, identity
// secrets) in the response body.
func Track(featureCode string, dimensions map[string]interface{}, handler http.HandlerFunc) http.HandlerFunc {
	cfg := config.GetConfig()
	if cfg.IsOnPremDeployment || cfg.GrowthAnalytics.MoesifApplicationID == "" {
		return handler
	}

	initOnce.Do(func() { initShared(cfg) })

	if sharedWrapped == nil {
		// initShared recovered from a panic (e.g. an invalid Application ID)
		// and left nothing to dispatch through — fall back to the plain
		// handler rather than fail the request.
		return handler
	}

	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("growthanalytics: recovered panic reporting event, request already served", "panic", rec, "feature", featureCode)
			}
		}()

		ctx := context.WithValue(r.Context(), featureCodeKey, featureCode)
		ctx = context.WithValue(ctx, dimensionsKey, dimensions)
		ctx = context.WithValue(ctx, targetHandlerKey, handler)
		ctx = context.WithValue(ctx, statusHolderKey, &statusHolder{code: http.StatusOK})
		sharedWrapped.ServeHTTP(w, r.WithContext(ctx))
	}
}

func initShared(cfg *config.Config) {
	defer func() {
		if rec := recover(); rec != nil {
			slog.Error("growthanalytics: recovered panic initializing Moesif client, telemetry disabled for this process", "panic", rec)
			sharedWrapped = nil
		}
	}()

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
			dims, _ := req.Context().Value(dimensionsKey).(map[string]interface{})
			holder, _ := req.Context().Value(statusHolderKey).(*statusHolder)
			metadata := buildMetadata(fc, resolveDimensions(dims, holder), config.GetConfig().PackageVersion)

			// Fire-and-forget from the caller's perspective, but still logged:
			// this is the last point we control before the event is handed off
			// to the SDK's async queue, so it's the only place that can say
			// "we tried to send this" rather than silently maybe-doing nothing.
			logger.GetLogger(req.Context()).Info("growthanalytics: sending feature-usage event to Moesif",
				"feature", fc,
				"org_id", middleware.OUIDFromRequest(req),
				"metadata", metadata,
			)

			return metadata
		},
	}

	sharedWrapped = moesifWrap(http.HandlerFunc(dispatch), options)
}

// dispatch is the single handler every route is funneled through once
// wrapped by Moesif; it looks up which real handler to run for this request
// from the context Track populated, and records that handler's real
// response status for any dimension that depends on it.
func dispatch(w http.ResponseWriter, r *http.Request) {
	h, ok := r.Context().Value(targetHandlerKey).(http.HandlerFunc)
	if !ok {
		return
	}
	holder, _ := r.Context().Value(statusHolderKey).(*statusHolder)
	if holder == nil {
		h(w, r)
		return
	}
	h(&statusRecordingWriter{ResponseWriter: w, holder: holder}, r)
}

// resolveDimensions substitutes DynamicOutcome (if present) with the real
// outcome derived from the handler's captured response status, leaving
// every other dimension untouched. The input map is never mutated.
func resolveDimensions(dimensions map[string]interface{}, holder *statusHolder) map[string]interface{} {
	if dimensions == nil {
		return nil
	}
	resolved := make(map[string]interface{}, len(dimensions))
	for k, v := range dimensions {
		if k == "outcome" && v == DynamicOutcome {
			code := http.StatusOK
			if holder != nil {
				code = holder.code
			}
			resolved[k] = outcomeFromStatus(code)
			continue
		}
		resolved[k] = v
	}
	return resolved
}

// buildMetadata assembles the event metadata Get_Metadata emits: the
// feature code every event must carry, product/deployment context, and the
// route's resolved taxonomy dimensions. Extracted as a pure function so the
// metadata shape is unit-testable without touching the Moesif SDK.
func buildMetadata(featureCode string, dimensions map[string]interface{}, productVersion string) map[string]interface{} {
	meta := map[string]interface{}{
		"growth_action":    featureCode,
		"product_version":  productVersion,
		"deployment_model": "saas",
	}
	for k, v := range dimensions {
		meta[k] = v
	}
	return meta
}

// outcomeFromStatus classifies an HTTP status code into the "success"/
// "failure" outcome dimension the taxonomy declares for features whose
// tracked action can fail (e.g. amp.agent-development.build-agent).
func outcomeFromStatus(status int) string {
	if status >= http.StatusOK && status < http.StatusMultipleChoices {
		return "success"
	}
	return "failure"
}
