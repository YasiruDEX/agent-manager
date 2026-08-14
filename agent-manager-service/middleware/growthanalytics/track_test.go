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
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	moesifmiddleware "github.com/moesif/moesifmiddleware-go"

	"github.com/wso2/agent-manager/agent-manager-service/config"
)

// withGrowthAnalyticsConfig sets the SaaS/on-prem and Moesif Application ID
// fields on the process-wide config for the duration of the test, restoring
// the originals on cleanup — same pattern used elsewhere in this repo
// (see api/well_known_routes_test.go) since config.GetConfig() returns a
// pointer to the single package-level Config.
func withGrowthAnalyticsConfig(t *testing.T, onPrem bool, applicationID string) {
	t.Helper()
	cfg := config.GetConfig()
	origOnPrem := cfg.IsOnPremDeployment
	origAppID := cfg.GrowthAnalytics.MoesifApplicationID
	cfg.IsOnPremDeployment = onPrem
	cfg.GrowthAnalytics.MoesifApplicationID = applicationID
	t.Cleanup(func() {
		cfg.IsOnPremDeployment = origOnPrem
		cfg.GrowthAnalytics.MoesifApplicationID = origAppID
	})
}

// resetSharedState clears the package-level Moesif singleton so each test
// that exercises the "enabled" path starts from a clean sync.Once, and
// restores the real moesifWrap on cleanup so no test leaks a fake into
// another package's test run within the same binary.
func resetSharedState(t *testing.T) {
	t.Helper()
	origWrap := moesifWrap
	initOnce = sync.Once{}
	sharedWrapped = nil
	t.Cleanup(func() {
		moesifWrap = origWrap
		initOnce = sync.Once{}
		sharedWrapped = nil
	})
}

func TestTrack_NoOp_OnPremOrNoApplicationID(t *testing.T) {
	tests := []struct {
		name          string
		onPrem        bool
		applicationID string
	}{
		{"on-prem deployment, key configured", true, "app-id-should-be-ignored"},
		{"SaaS deployment, no key configured", false, ""},
		{"on-prem deployment, no key configured", true, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withGrowthAnalyticsConfig(t, tt.onPrem, tt.applicationID)
			resetSharedState(t)

			// A moesifWrap that fails the test if it's ever invoked — proves
			// Track truly never touches the Moesif SDK in the disabled case.
			moesifWrap = func(_ http.Handler, _ map[string]interface{}) http.Handler {
				t.Fatal("moesifWrap must not be called when growth analytics is disabled")
				return nil
			}

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

// fakeMoesifWrap simulates the parts of the real SDK this package depends
// on: it calls the wrapped handler, then invokes Get_Metadata (which is
// what Track's per-request dispatch and dimension resolution are actually
// tested through) and records the metadata for the test to inspect.
func fakeMoesifWrap(capturedMetadata *map[string]interface{}, capturedOptions *map[string]interface{}) func(http.Handler, map[string]interface{}) http.Handler {
	return func(next http.Handler, options map[string]interface{}) http.Handler {
		*capturedOptions = options
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			next.ServeHTTP(w, r)
			var resp moesifmiddleware.MoesifResponseRecorder
			if getMeta, ok := options["Get_Metadata"].(func(*http.Request, moesifmiddleware.MoesifResponseRecorder) map[string]interface{}); ok {
				*capturedMetadata = getMeta(r, resp)
			}
		})
	}
}

func TestTrack_DispatchesToCorrectHandlerAndFeatureCode(t *testing.T) {
	withGrowthAnalyticsConfig(t, false, "test-application-id")
	resetSharedState(t)

	var metadata map[string]interface{}
	var options map[string]interface{}
	moesifWrap = fakeMoesifWrap(&metadata, &options)

	var createRan, updateRan bool
	createHandler := func(w http.ResponseWriter, r *http.Request) { createRan = true; w.WriteHeader(http.StatusCreated) }
	updateHandler := func(w http.ResponseWriter, r *http.Request) { updateRan = true; w.WriteHeader(http.StatusOK) }

	trackedCreate := Track("amp.agent-development.create-agent",
		map[string]interface{}{"creation_method": "platform-hosted"}, createHandler)
	trackedUpdate := Track("amp.agent-development.update-agent",
		map[string]interface{}{"update_target": "basic-info"}, updateHandler)

	// Two different features sharing the same singleton Moesif wrapper —
	// this is the regression case for the bug where the SDK's own
	// package-level option globals meant every route after the first kept
	// reporting the first route's feature code.
	trackedCreate(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))
	if !createRan {
		t.Fatal("create handler did not run")
	}
	if got := metadata["growth_action"]; got != "amp.agent-development.create-agent" {
		t.Errorf("growth_action = %v, want amp.agent-development.create-agent", got)
	}
	if got := metadata["creation_method"]; got != "platform-hosted" {
		t.Errorf("creation_method = %v, want platform-hosted", got)
	}

	trackedUpdate(httptest.NewRecorder(), httptest.NewRequest(http.MethodPut, "/agents/x", nil))
	if !updateRan {
		t.Fatal("update handler did not run")
	}
	if got := metadata["growth_action"]; got != "amp.agent-development.update-agent" {
		t.Errorf("growth_action = %v, want amp.agent-development.update-agent (singleton reuse bug)", got)
	}
	if got := metadata["update_target"]; got != "basic-info" {
		t.Errorf("update_target = %v, want basic-info", got)
	}

	if appID, _ := options["Application_Id"].(string); appID != "test-application-id" {
		t.Errorf("Application_Id = %v, want test-application-id", appID)
	}
	if logBody, ok := options["Log_Body"].(bool); !ok || logBody {
		t.Errorf("Log_Body = %v, want false (request/response bodies must never be forwarded)", options["Log_Body"])
	}
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
			withGrowthAnalyticsConfig(t, false, "test-application-id")
			resetSharedState(t)

			var metadata map[string]interface{}
			var options map[string]interface{}
			moesifWrap = fakeMoesifWrap(&metadata, &options)

			handler := func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(tt.statusCode) }
			tracked := Track("amp.agent-development.build-agent",
				map[string]interface{}{"outcome": DynamicOutcome}, handler)

			tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents/x/builds", nil))

			if got := metadata["outcome"]; got != tt.wantOutcome {
				t.Errorf("outcome = %v, want %v", got, tt.wantOutcome)
			}
		})
	}
}

func TestTrack_PanicInHandlerDoesNotCrashTheProcess(t *testing.T) {
	// Fire-and-forget requires that a panic anywhere in the tracking path
	// (including inside the wrapped SDK call) surfaces as a recovered error,
	// never a crashed request. This exercises Track's own recover(), not the
	// business handler's — a panicking business handler is the router's
	// concern, not growthanalytics's.
	withGrowthAnalyticsConfig(t, false, "test-application-id")
	resetSharedState(t)

	moesifWrap = func(_ http.Handler, _ map[string]interface{}) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			panic("simulated Moesif SDK failure")
		})
	}

	handlerRan := false
	tracked := Track("amp.agent-development.create-agent", nil, func(w http.ResponseWriter, r *http.Request) {
		handlerRan = true
	})

	defer func() {
		if rec := recover(); rec != nil {
			t.Fatalf("Track leaked a panic instead of recovering it: %v", rec)
		}
	}()
	tracked(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/agents", nil))

	// The fake SDK panics before ever calling next.ServeHTTP, mirroring an
	// init-time or pre-dispatch SDK failure, so the business handler
	// correctly does not run in this specific scenario — what matters is
	// that the panic never escaped Track.
	_ = handlerRan
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
