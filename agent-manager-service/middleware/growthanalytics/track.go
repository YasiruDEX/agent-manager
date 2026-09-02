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
// Events are posted directly to Moesif's Events API
// (POST /v1/events) through moesif-collector-api, an authenticated
// OpenChoreo reverse-proxy component that validates a platform-idp JWT and
// injects the real Moesif Application ID server-side — this package never
// handles that credential, only the JWT (see
// clients/moesifcollector). Earlier this went through the Moesif SDK
// directly; that's no longer available from this deployment, hence the
// proxy.
//
// Tracking is always fire-and-forget: it must never change a request's
// outcome or add observable latency to it. The wrapped handler always runs
// first, on the caller's own goroutine, completely outside any recover() —
// a panic there is the router's concern, not this package's, and must
// propagate exactly as it would for an untracked route. Only the
// metadata-building and event-send that happens *after* the handler
// returns — which can no longer affect the response already written — runs
// under a recover() and is dispatched to its own goroutine, so a bad token,
// an unreachable proxy, or any bug in this package surfaces as a log line,
// never a hung or broken request.
package growthanalytics

import (
	"context"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/wso2/agent-manager/agent-manager-service/clients/moesifcollector"
	"github.com/wso2/agent-manager/agent-manager-service/clients/requests"
	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/logger"
)

type ctxKey int

const overridesKey ctxKey = iota

// eventSendTimeout bounds how long the detached goroutine that posts an
// event to the collector proxy may run, so a hung/unreachable proxy can
// never accumulate unbounded background goroutines.
const eventSendTimeout = 10 * time.Second

// dimensionOverrides carries dimension values a handler only learns after
// looking at the request body (e.g. create-agent's creation_method, which
// depends on the payload's provisioning type) from the handler back to the
// point where the event is built. Track's static `dimensions` argument
// can't express these — it's fixed at route-registration time — so a
// handler reports them at request time instead, via SetDimension.
type dimensionOverrides struct {
	mu   sync.Mutex
	vals map[string]interface{}
}

func (d *dimensionOverrides) set(key string, value interface{}) {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.vals == nil {
		d.vals = make(map[string]interface{})
	}
	d.vals[key] = value
}

func (d *dimensionOverrides) snapshot() map[string]interface{} {
	d.mu.Lock()
	defer d.mu.Unlock()
	out := make(map[string]interface{}, len(d.vals))
	for k, v := range d.vals {
		out[k] = v
	}
	return out
}

// SetDimension lets a handler wrapped by Track report a dimension value that
// can only be known once the handler actually runs and inspects the request
// — e.g. amp.agent-development.create-agent's creation_method, which depends
// on the request body's provisioning type, not just which route fired.
// Overrides win over any static dimension of the same name passed to Track.
//
// It's a no-op if called outside a Track-wrapped request (e.g. a unit test
// that calls the controller directly), so handlers can call it
// unconditionally without checking whether tracking is enabled.
func SetDimension(ctx context.Context, key string, value interface{}) {
	if o, ok := ctx.Value(overridesKey).(*dimensionOverrides); ok {
		o.set(key, value)
	}
}

// DynamicOutcome is a sentinel value: pass it under the "outcome" key in
// Track's dimensions to have the actual outcome ("success"/"failure")
// computed from the wrapped handler's real response status instead of a
// fixed value supplied up front.
var DynamicOutcome = struct{ dynamicOutcome bool }{true}

// statusHolder carries the wrapped handler's real response status from the
// request goroutine to the event-building step, since "outcome" is the only
// dimension that depends on the response.
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

// eventSender abstracts posting a built event to the collector proxy, so
// tests can substitute a fake and never make a network call.
type eventSender interface {
	SendEvent(ctx context.Context, evt moesifcollector.Event) error
}

// sharedHTTPClient is reused across every Track-wrapped request so
// connections to the collector proxy get pooled rather than dialed fresh
// per event.
var sharedHTTPClient = requests.NewRetryableHTTPClient(&http.Client{Timeout: eventSendTimeout})

// newSender builds the eventSender used to deliver an event, from the
// current GrowthAnalytics config. A package var so tests can substitute a
// fake in place of the real client.
var newSender = func(ga config.GrowthAnalyticsConfig) eventSender {
	return moesifcollector.NewClient(sharedHTTPClient, ga.MoesifCollectorBaseURL, ga.MoesifCollectorToken, ga.MoesifCollectorHostHeader)
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
// deployment with the Moesif collector proxy configured (IsOnPremDeployment
// is false and both GrowthAnalytics.MoesifCollectorBaseURL and
// MoesifCollectorToken are set), so the OSS/on-prem build never emits
// telemetry.
//
// Request and response bodies are never forwarded to Moesif: several of the
// routes this wraps return generated secrets (API keys, tokens, identity
// secrets) in the response body.
func Track(featureCode string, dimensions map[string]interface{}, handler http.HandlerFunc) http.HandlerFunc {
	cfg := config.GetConfig()
	ga := cfg.GrowthAnalytics
	if cfg.IsOnPremDeployment || ga.MoesifCollectorBaseURL == "" || ga.MoesifCollectorToken == "" {
		return handler
	}

	return func(w http.ResponseWriter, r *http.Request) {
		overrides := &dimensionOverrides{}
		ctx := context.WithValue(r.Context(), overridesKey, overrides)
		holder := &statusHolder{code: http.StatusOK}
		sw := &statusRecordingWriter{ResponseWriter: w, holder: holder}

		reqSnapshot := snapshotRequest(r)
		userID := identifyUser(ctx)
		companyID := middleware.OUIDFromRequest(r)

		// The business handler runs completely outside any recover() here —
		// a panic in it must propagate exactly as it would for an untracked
		// route, not get silently absorbed by this package.
		handler(sw, r.WithContext(ctx))

		reportEvent(r.Context(), ga, featureCode, dimensions, overrides, holder, reqSnapshot, userID, companyID)
	}
}

// reportEvent resolves the event's final metadata and fires off the send to
// the collector proxy on a detached goroutine. The response has already
// been fully written by the time this runs, so nothing here can affect the
// request's outcome — a recover() guards the synchronous part (building the
// event) and the goroutine guards itself the same way.
func reportEvent(
	requestCtx context.Context,
	ga config.GrowthAnalyticsConfig,
	featureCode string,
	dimensions map[string]interface{},
	overrides *dimensionOverrides,
	holder *statusHolder,
	reqSnapshot moesifcollector.EventRequest,
	userID, companyID string,
) {
	defer func() {
		if rec := recover(); rec != nil {
			slog.Error("growthanalytics: recovered panic reporting event, request already served", "panic", rec, "feature", featureCode)
		}
	}()

	resolved := resolveDimensions(dimensions, holder)
	for k, v := range overrides.snapshot() {
		if resolved == nil {
			resolved = make(map[string]interface{})
		}
		resolved[k] = v
	}
	metadata := buildMetadata(featureCode, resolved, config.GetConfig().PackageVersion)

	evt := moesifcollector.Event{
		Request: reqSnapshot,
		Response: moesifcollector.EventResponse{
			Time:   time.Now().UTC().Format(time.RFC3339),
			Status: holder.code,
		},
		UserID:    userID,
		CompanyID: companyID,
		Metadata:  metadata,
	}

	// Logged here, before the async hand-off, since this is the last point
	// this package controls before the send is fired off in the
	// background — the only place that can say "we tried to send this"
	// rather than silently maybe-doing nothing.
	logger.GetLogger(requestCtx).Info("growthanalytics: sending feature-usage event to Moesif collector",
		"feature", featureCode,
		"org_id", companyID,
		"metadata", metadata,
	)

	sender := newSender(ga)
	go func() {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("growthanalytics: recovered panic sending event", "panic", rec, "feature", featureCode)
			}
		}()
		ctx, cancel := context.WithTimeout(context.WithoutCancel(requestCtx), eventSendTimeout)
		defer cancel()
		if err := sender.SendEvent(ctx, evt); err != nil {
			slog.Error("growthanalytics: failed to send event to Moesif collector", "error", err, "feature", featureCode)
		}
	}()
}

// identifyUser resolves the event's user_id from the request's validated
// JWT, mirroring the taxonomy's need to attribute usage to the acting user.
func identifyUser(ctx context.Context) string {
	claims := jwtassertion.GetTokenClaims(ctx)
	if claims == nil {
		return ""
	}
	return claims.Sub
}

// snapshotRequest captures the request-side fields reported to Moesif.
// Deliberately excludes headers and body — see the package doc comment.
func snapshotRequest(r *http.Request) moesifcollector.EventRequest {
	return moesifcollector.EventRequest{
		Time:      time.Now().UTC().Format(time.RFC3339),
		URI:       requestURI(r),
		Verb:      r.Method,
		IPAddress: clientIP(r),
	}
}

// requestURI reconstructs the request's absolute URL on a best-effort basis:
// this service normally sits behind a gateway/proxy, so the scheme is taken
// from X-Forwarded-Proto when present rather than assumed from r.TLS.
func requestURI(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if proto := r.Header.Get("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	host := r.Host
	if host == "" {
		host = "unknown"
	}
	return scheme + "://" + host + r.URL.RequestURI()
}

// clientIP extracts the caller's address, preferring a proxy-supplied
// X-Forwarded-For over the immediate TCP peer.
func clientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		if idx := strings.IndexByte(fwd, ','); idx >= 0 {
			return strings.TrimSpace(fwd[:idx])
		}
		return strings.TrimSpace(fwd)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
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

// buildMetadata assembles the event metadata: the feature code every event
// must carry, product/deployment context, and the route's resolved
// taxonomy dimensions. Extracted as a pure function so the metadata shape
// is unit-testable without touching the network.
func buildMetadata(featureCode string, dimensions map[string]interface{}, productVersion string) map[string]interface{} {
	meta := map[string]interface{}{
		"platform":         "Agent Manager",
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
