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

package growthanalytics

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/wso2/agent-manager/agent-manager-service/clients/moesifcollector"
	"github.com/wso2/agent-manager/agent-manager-service/config"
)

// withGrowthAnalyticsConfig sets the SaaS/on-prem and collector fields on
// the process-wide config for the duration of the test, restoring the
// originals on cleanup — same pattern used elsewhere in this repo (see
// api/well_known_routes_test.go) since config.GetConfig() returns a pointer
// to the single package-level Config.
func withGrowthAnalyticsConfig(t *testing.T, onPrem bool, baseURL, token string) {
	t.Helper()
	cfg := config.GetConfig()
	origOnPrem := cfg.IsOnPremDeployment
	origGA := cfg.GrowthAnalytics
	cfg.IsOnPremDeployment = onPrem
	cfg.GrowthAnalytics = config.GrowthAnalyticsConfig{
		MoesifCollectorBaseURL: baseURL,
		MoesifCollectorToken:   token,
	}
	t.Cleanup(func() {
		cfg.IsOnPremDeployment = origOnPrem
		cfg.GrowthAnalytics = origGA
	})
}

// fakeSender substitutes for the real moesifcollector.Client, so tests never
// make a network call. Each SendEvent also publishes on calls, since Track
// dispatches the send on a detached goroutine — tests need a way to wait
// deterministically for it rather than racing a background send.
type fakeSender struct {
	mu    sync.Mutex
	sent  []moesifcollector.Event
	err   error
	calls chan moesifcollector.Event
}

func newFakeSender() *fakeSender {
	return &fakeSender{calls: make(chan moesifcollector.Event, 8)}
}

func (f *fakeSender) SendEvent(_ context.Context, evt moesifcollector.Event) error {
	f.mu.Lock()
	f.sent = append(f.sent, evt)
	f.mu.Unlock()
	f.calls <- evt
	return f.err
}

// withFakeSender substitutes newSender for the duration of the test,
// restoring the original on cleanup.
func withFakeSender(t *testing.T) *fakeSender {
	t.Helper()
	fs := newFakeSender()
	orig := newSender
	newSender = func(config.GrowthAnalyticsConfig) eventSender { return fs }
	t.Cleanup(func() { newSender = orig })
	return fs
}

func waitForEvent(t *testing.T, fs *fakeSender) moesifcollector.Event {
	t.Helper()
	select {
	case evt := <-fs.calls:
		return evt
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for event to be sent to the collector")
		return moesifcollector.Event{}
	}
}

func TestTrack_NoOp_OnPremOrNotConfigured(t *testing.T) {
	tests := []struct {
		name    string
		onPrem  bool
		baseURL string
		token   string
	}{
		{"on-prem deployment, fully configured", true, "http://localhost:18080/moesif-collector", "test-token"},
		{"SaaS deployment, no base URL", false, "", "test-token"},
		{"SaaS deployment, no token", false, "http://localhost:18080/moesif-collector", ""},
		{"on-prem deployment, nothing configured", true, "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withGrowthAnalyticsConfig(t, tt.onPrem, tt.baseURL, tt.token)

			orig := newSender
			newSender = func(config.GrowthAnalyticsConfig) eventSender {
				t.Fatal("newSender must not be called when growth analytics is disabled")
				return nil
			}
			t.Cleanup(func() { newSender = orig })

			ran := false
			handler := func(w http.ResponseWriter, r *http.Request) {
				ran = true
				w.WriteHeader(http.StatusCreated)
			}

			wrapped := Track("amp.agent-development.create-agent", map[string]interface{}{"creation_method": "platform-hosted"}, handler)

			rec := httptest.NewRecorder()
			req := httptest.NewRequest(http.MethodPost, "/agents", nil)
			wrapped(rec, req)

			if !ran {
				t.Error("expected the wrapped handler to run even when tracking is disabled")
			}
			if rec.Code != http.StatusCreated {
				t.Errorf("status = %d, want %d", rec.Code, http.StatusCreated)
			}
		})
	}
}

func TestTrack_ReportsCorrectFeatureCodeAndDimensionsPerRoute(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")
	fs := withFakeSender(t)

	var createRan, updateRan bool
	createHandler := func(w http.ResponseWriter, r *http.Request) { createRan = true; w.WriteHeader(http.StatusCreated) }
	updateHandler := func(w http.ResponseWriter, r *http.Request) { updateRan = true; w.WriteHeader(http.StatusOK) }

	trackedCreate := Track("amp.agent-development.create-agent",
		map[string]interface{}{"creation_method": "platform-hosted"}, createHandler)
	trackedUpdate := Track("amp.agent-development.update-agent",
		map[string]interface{}{"update_target": "basic-info"}, updateHandler)

	trackedCreate(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))
	if !createRan {
		t.Fatal("create handler did not run")
	}
	evt := waitForEvent(t, fs)
	if got := evt.Metadata["growth_action"]; got != "amp.agent-development.create-agent" {
		t.Errorf("growth_action = %v, want amp.agent-development.create-agent", got)
	}
	if got := evt.Metadata["creation_method"]; got != "platform-hosted" {
		t.Errorf("creation_method = %v, want platform-hosted", got)
	}
	if evt.Response.Status != http.StatusCreated {
		t.Errorf("response.status = %d, want %d", evt.Response.Status, http.StatusCreated)
	}
	if evt.Request.Verb != http.MethodPost {
		t.Errorf("request.verb = %q, want POST", evt.Request.Verb)
	}

	trackedUpdate(httptest.NewRecorder(), httptest.NewRequest(http.MethodPut, "/agents/x", nil))
	if !updateRan {
		t.Fatal("update handler did not run")
	}
	evt = waitForEvent(t, fs)
	if got := evt.Metadata["growth_action"]; got != "amp.agent-development.update-agent" {
		t.Errorf("growth_action = %v, want amp.agent-development.update-agent", got)
	}
	if got := evt.Metadata["update_target"]; got != "basic-info" {
		t.Errorf("update_target = %v, want basic-info", got)
	}
}

func TestTrack_SetDimension_ReportsValueDiscoveredInsideTheHandler(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")
	fs := withFakeSender(t)

	// Simulates create-agent: the route has no static creation_method dimension
	// (nil), because it isn't known until the controller parses the request
	// body — the controller calls SetDimension itself once it knows.
	handler := func(w http.ResponseWriter, r *http.Request) {
		SetDimension(r.Context(), "creation_method", "external")
		w.WriteHeader(http.StatusAccepted)
	}
	tracked := Track("amp.agent-development.create-agent", nil, handler)

	tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))

	evt := waitForEvent(t, fs)
	if got := evt.Metadata["creation_method"]; got != "external" {
		t.Errorf("creation_method = %v, want external", got)
	}
	if got := evt.Metadata["growth_action"]; got != "amp.agent-development.create-agent" {
		t.Errorf("growth_action = %v, want amp.agent-development.create-agent", got)
	}
}

func TestTrack_SetDimension_OverridesAStaticDimensionOfTheSameName(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")
	fs := withFakeSender(t)

	handler := func(w http.ResponseWriter, r *http.Request) {
		SetDimension(r.Context(), "creation_method", "from-kind")
	}
	// A wrong static value, same as the bug being fixed — SetDimension must win.
	tracked := Track("amp.agent-development.create-agent",
		map[string]interface{}{"creation_method": "platform-hosted"}, handler)

	tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))

	evt := waitForEvent(t, fs)
	if got := evt.Metadata["creation_method"]; got != "from-kind" {
		t.Errorf("creation_method = %v, want from-kind (SetDimension should override the static value)", got)
	}
}

func TestSetDimension_NoOpOutsideATrackedRequest(t *testing.T) {
	// A unit test calling a controller directly (no Track wrapper, no
	// request context set up by it) must not panic.
	defer func() {
		if rec := recover(); rec != nil {
			t.Fatalf("SetDimension panicked outside a tracked request: %v", rec)
		}
	}()
	SetDimension(context.Background(), "creation_method", "external")
}

func TestTrack_DynamicOutcome_ReflectsRealResponseStatus(t *testing.T) {
	tests := []struct {
		name        string
		statusCode  int
		wantOutcome string
	}{
		{"2xx is success", http.StatusCreated, "success"},
		{"4xx is failure", http.StatusBadRequest, "failure"},
		{"5xx is failure", http.StatusInternalServerError, "failure"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")
			fs := withFakeSender(t)

			handler := func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(tt.statusCode) }
			tracked := Track("amp.agent-development.build-agent",
				map[string]interface{}{"outcome": DynamicOutcome}, handler)

			tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents/x/builds", nil))

			evt := waitForEvent(t, fs)
			if got := evt.Metadata["outcome"]; got != tt.wantOutcome {
				t.Errorf("outcome = %v, want %v", got, tt.wantOutcome)
			}
			if evt.Response.Status != tt.statusCode {
				t.Errorf("response.status = %d, want %d", evt.Response.Status, tt.statusCode)
			}
		})
	}
}

// TestTrack_HandlerPanicPropagatesNormally verifies that Track no longer
// (unlike the old SDK-wrapped implementation) recovers a panic raised by
// the wrapped business handler itself — that's the router's concern, not
// growthanalytics's. Only the tracking code that runs after the handler
// returns is guarded by a recover().
func TestTrack_HandlerPanicPropagatesNormally(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")
	withFakeSender(t)

	tracked := Track("amp.agent-development.create-agent", nil, func(w http.ResponseWriter, r *http.Request) {
		panic("business handler failure")
	})

	defer func() {
		if rec := recover(); rec == nil {
			t.Fatal("expected the handler's panic to propagate out of Track, not be swallowed")
		}
	}()
	tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))
}

// panicSender simulates a broken collector client (e.g. a bug in
// moesifcollector.Client) to prove a panic there can never crash the
// process or affect the response already sent to the caller.
type panicSender struct{ started chan struct{} }

func (p panicSender) SendEvent(context.Context, moesifcollector.Event) error {
	close(p.started)
	panic("simulated collector client failure")
}

func TestTrack_PanicSendingEventDoesNotCrashTheProcessOrAffectTheResponse(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "http://localhost:18080/moesif-collector", "test-token")

	ps := panicSender{started: make(chan struct{})}
	orig := newSender
	newSender = func(config.GrowthAnalyticsConfig) eventSender { return ps }
	t.Cleanup(func() { newSender = orig })

	handlerRan := false
	tracked := Track("amp.agent-development.create-agent", nil, func(w http.ResponseWriter, r *http.Request) {
		handlerRan = true
		w.WriteHeader(http.StatusCreated)
	})

	rec := httptest.NewRecorder()
	tracked(rec, httptest.NewRequest(http.MethodPost, "/agents", nil))

	if !handlerRan {
		t.Fatal("handler did not run")
	}
	if rec.Code != http.StatusCreated {
		t.Errorf("status = %d, want %d (must be unaffected by a failure sending the event)", rec.Code, http.StatusCreated)
	}

	select {
	case <-ps.started:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for the panicking sender to be invoked")
	}
	// Give the detached goroutine's recover() a moment to run. If it
	// doesn't, the panic crashes the whole test binary — there's nothing
	// else to assert on for that case.
	time.Sleep(50 * time.Millisecond)
}

func TestBuildMetadata(t *testing.T) {
	tests := []struct {
		name       string
		feature    string
		dimensions map[string]interface{}
		version    string
		want       map[string]interface{}
	}{
		{
			name:    "no dimensions",
			feature: "amp.agent-development.delete-agent",
			version: "1.2.3",
			want: map[string]interface{}{
				"platform":         "Agent Manager",
				"growth_action":    "amp.agent-development.delete-agent",
				"product_version":  "1.2.3",
				"deployment_model": "saas",
			},
		},
		{
			name:       "dimensions are merged in",
			feature:    "amp.agent-development.update-agent",
			dimensions: map[string]interface{}{"update_target": "configurations"},
			version:    "1.2.3",
			want: map[string]interface{}{
				"platform":         "Agent Manager",
				"growth_action":    "amp.agent-development.update-agent",
				"product_version":  "1.2.3",
				"deployment_model": "saas",
				"update_target":    "configurations",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildMetadata(tt.feature, tt.dimensions, tt.version)
			if len(got) != len(tt.want) {
				t.Fatalf("buildMetadata() = %v, want %v", got, tt.want)
			}
			for k, wantV := range tt.want {
				if got[k] != wantV {
					t.Errorf("buildMetadata()[%q] = %v, want %v", k, got[k], wantV)
				}
			}
		})
	}
}

func TestResolveDimensions(t *testing.T) {
	t.Run("nil dimensions stay nil", func(t *testing.T) {
		if got := resolveDimensions(nil, &statusHolder{code: http.StatusOK}); got != nil {
			t.Errorf("resolveDimensions(nil, ...) = %v, want nil", got)
		}
	})

	t.Run("does not mutate the input map", func(t *testing.T) {
		input := map[string]interface{}{"outcome": DynamicOutcome}
		_ = resolveDimensions(input, &statusHolder{code: http.StatusInternalServerError})
		if input["outcome"] != DynamicOutcome {
			t.Error("resolveDimensions mutated its input map")
		}
	})

	t.Run("non-outcome dimensions pass through unchanged", func(t *testing.T) {
		got := resolveDimensions(map[string]interface{}{"action": "create"}, nil)
		if got["action"] != "create" {
			t.Errorf(`got["action"] = %v, want "create"`, got["action"])
		}
	})

	t.Run("nil status holder defaults to success", func(t *testing.T) {
		got := resolveDimensions(map[string]interface{}{"outcome": DynamicOutcome}, nil)
		if got["outcome"] != "success" {
			t.Errorf(`got["outcome"] = %v, want "success"`, got["outcome"])
		}
	})
}

func TestOutcomeFromStatus(t *testing.T) {
	tests := []struct {
		status int
		want   string
	}{
		{http.StatusOK, "success"},
		{http.StatusCreated, "success"},
		{http.StatusMultipleChoices, "failure"},
		{http.StatusBadRequest, "failure"},
		{http.StatusInternalServerError, "failure"},
	}
	for _, tt := range tests {
		if got := outcomeFromStatus(tt.status); got != tt.want {
			t.Errorf("outcomeFromStatus(%d) = %q, want %q", tt.status, got, tt.want)
		}
	}
}

func TestClientIP(t *testing.T) {
	tests := []struct {
		name       string
		remoteAddr string
		forwardFor string
		want       string
	}{
		{"no forwarded header uses remote addr host", "203.0.113.9:44321", "", "203.0.113.9"},
		{"forwarded-for wins over remote addr", "203.0.113.9:44321", "198.51.100.4", "198.51.100.4"},
		{"first entry of a comma-separated forwarded-for", "203.0.113.9:44321", "198.51.100.4, 10.0.0.1", "198.51.100.4"},
		{"malformed remote addr falls back to raw value", "not-a-host-port", "", "not-a-host-port"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodGet, "/", nil)
			r.RemoteAddr = tt.remoteAddr
			if tt.forwardFor != "" {
				r.Header.Set("X-Forwarded-For", tt.forwardFor)
			}
			if got := clientIP(r); got != tt.want {
				t.Errorf("clientIP() = %q, want %q", got, tt.want)
			}
		})
	}
}
