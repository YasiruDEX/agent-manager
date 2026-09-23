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

package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
)

// consoleActionsRequest builds an authenticated request the way the middleware
// stack would leave it by the time the handler runs.
func consoleActionsRequest(t *testing.T, body string) *http.Request {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, "/telemetry/console-actions", strings.NewReader(body))
	ctx := jwtassertion.ContextWithTokenClaims(context.Background(),
		&jwtassertion.TokenClaims{Sub: "user-1", OuId: "ou-1"})
	ctx = jwtassertion.ContextWithJWT(ctx, "caller-jwt")
	return r.WithContext(ctx)
}

func decodeBatchResponse(t *testing.T, body []byte) (accepted, dropped float64) {
	t.Helper()
	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		t.Fatalf("response is not JSON: %v (%s)", err, body)
	}
	// WriteSuccessResponse may wrap the payload; accept either shape.
	payload := resp
	if inner, ok := resp["data"].(map[string]interface{}); ok {
		payload = inner
	}
	accepted, _ = payload["accepted"].(float64)
	dropped, _ = payload["dropped"].(float64)
	return accepted, dropped
}

// TestConsoleActionsRejectsMalformedBody: a body that is not a batch is the
// one client-side failure worth reporting, since retrying will not fix it.
func TestConsoleActionsRejectsMalformedBody(t *testing.T) {
	for _, body := range []string{"not json", `{"actions":[]}`, `{}`} {
		w := httptest.NewRecorder()
		handleConsoleActions(w, consoleActionsRequest(t, body))
		if w.Code != http.StatusBadRequest {
			t.Errorf("body %q → status %d, want 400", body, w.Code)
		}
	}
}

// TestConsoleActionsRejectsOversizedBatch bounds the fan-out: one request must
// not be able to push an unbounded payload through to the collector.
func TestConsoleActionsRejectsOversizedBatch(t *testing.T) {
	actions := make([]map[string]string, maxConsoleActionsPerBatch+1)
	for i := range actions {
		actions[i] = map[string]string{"action": "amp.console.navigation.page-view"}
	}
	body, err := json.Marshal(map[string]interface{}{"actions": actions})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	w := httptest.NewRecorder()
	handleConsoleActions(w, consoleActionsRequest(t, string(body)))
	if w.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("status = %d, want 413", w.Code)
	}
}

func TestConsoleActionsRejectsOversizedBody(t *testing.T) {
	padding := strings.Repeat("x", maxConsoleActionBatchBytes+1)
	body := `{"actions":[{"action":"amp.console.navigation.page-view","page":"` + padding + `"}]}`

	w := httptest.NewRecorder()
	r := consoleActionsRequest(t, body)
	handleConsoleActions(w, r)
	if w.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("status = %d, want 413", w.Code)
	}
}

// TestConsoleActionsAcceptsBatchWithUnknownActions is the compatibility
// contract: a console newer than the service must degrade quietly. The
// unrecognized actions are dropped and counted, never 4xx'd, because the
// client cannot act on the failure and must not retry.
//
// Telemetry export is off in the unit tier (no collector URL configured), so
// every action reports as dropped — which is itself the behavior that matters
// here: the response shape and status do not depend on whether this deployment
// reports anything.
func TestConsoleActionsAcceptsBatchWithUnknownActions(t *testing.T) {
	body := `{"actions":[
		{"action":"amp.console.navigation.page-view"},
		{"action":"amp.console.invented-by-a-newer-console"}
	]}`

	w := httptest.NewRecorder()
	handleConsoleActions(w, consoleActionsRequest(t, body))

	if w.Code != http.StatusAccepted {
		t.Fatalf("status = %d, want 202", w.Code)
	}
	accepted, dropped := decodeBatchResponse(t, w.Body.Bytes())
	if accepted+dropped != 2 {
		t.Errorf("accepted+dropped = %v, want 2 (body %s)", accepted+dropped, w.Body.String())
	}
}

// TestConsoleActionsWithReportingDisabledStillAccepts: with export off the
// endpoint must keep answering 202, or every console in the fleet logs a
// failed telemetry call on every flush.
func TestConsoleActionsWithReportingDisabledStillAccepts(t *testing.T) {
	body := `{"actions":[{"action":"amp.console.navigation.page-view"}]}`

	w := httptest.NewRecorder()
	handleConsoleActions(w, consoleActionsRequest(t, body))

	if w.Code != http.StatusAccepted {
		t.Errorf("status = %d, want 202", w.Code)
	}
}

// TestConsoleActionsWithoutClaimsDoesNotPanic: the route sits behind the auth
// middleware, so absent claims mean an upstream bug — it must degrade to a
// dropped batch, not a 500.
func TestConsoleActionsWithoutClaimsDoesNotPanic(t *testing.T) {
	r := httptest.NewRequest(http.MethodPost, "/telemetry/console-actions",
		bytes.NewBufferString(`{"actions":[{"action":"amp.console.navigation.page-view"}]}`))

	w := httptest.NewRecorder()
	handleConsoleActions(w, r)

	if w.Code != http.StatusAccepted {
		t.Errorf("status = %d, want 202", w.Code)
	}
}
