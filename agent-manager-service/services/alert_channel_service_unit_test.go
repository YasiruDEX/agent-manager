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

package services

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/audit"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
	"github.com/wso2/agent-manager/agent-manager-service/repositories/repomocks"
	"github.com/wso2/agent-manager/agent-manager-service/services/alertchannels"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

var testAlertKey = []byte("0123456789abcdef0123456789abcdef")

// fakeChannelDriver is a "fake" kind: settings {"dest": "..."} and an
// optional generated secret.
type fakeChannelDriver struct {
	hasSecret bool
	result    alertchannels.Result
	sent      []alertchannels.Destination
	msgs      []alertchannels.Message
}

func (f *fakeChannelDriver) Kind() string { return "fake" }

func (f *fakeChannelDriver) NormalizeConfig(_ context.Context, raw json.RawMessage) (json.RawMessage, error) {
	var cfg struct {
		Dest string `json:"dest"`
	}
	if err := json.Unmarshal(raw, &cfg); err != nil || cfg.Dest == "" {
		return nil, utils.ErrInvalidInput
	}
	out, _ := json.Marshal(cfg)
	return out, nil
}

func (f *fakeChannelDriver) RedactConfig(json.RawMessage) json.RawMessage {
	return json.RawMessage(`{"dest":"masked"}`)
}

func (f *fakeChannelDriver) Origin(json.RawMessage) string { return "fake://dest" }

func (f *fakeChannelDriver) NewSecret() (string, bool, error) {
	if !f.hasSecret {
		return "", false, nil
	}
	return "secret-" + uuid.NewString(), true, nil
}

func (f *fakeChannelDriver) Deliver(_ context.Context, d alertchannels.Destination, m alertchannels.Message) alertchannels.Result {
	f.sent = append(f.sent, d)
	f.msgs = append(f.msgs, m)
	return f.result
}

// recordingAuditor keeps every audit event.
type recordingAuditor struct {
	mu     sync.Mutex
	events []audit.Event
	fail   error
}

func (r *recordingAuditor) Record(_ context.Context, e audit.Event) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.events = append(r.events, e)
}

func (r *recordingAuditor) RecordSync(_ context.Context, e audit.Event) error {
	if r.fail != nil {
		return r.fail
	}
	r.Record(context.Background(), e)
	return nil
}

func (r *recordingAuditor) Close(context.Context) error { return nil }

func (r *recordingAuditor) actions() []audit.Action {
	r.mu.Lock()
	defer r.mu.Unlock()
	out := make([]audit.Action, 0, len(r.events))
	for _, e := range r.events {
		out = append(out, e.Action)
	}
	return out
}

func newAlertChannelRepoMock() *repomocks.AlertChannelRepositoryMock {
	store := map[uuid.UUID]*models.AlertChannel{}
	matches := func(c *models.AlertChannel, t repositories.AlertTarget) bool {
		return c.OUID == t.OUID && c.Scope == t.Scope && c.ProjectName == t.ProjectName && c.AgentName == t.AgentName
	}
	return &repomocks.AlertChannelRepositoryMock{
		ListChannelsFunc: func(_ context.Context, t repositories.AlertTarget) ([]models.AlertChannel, error) {
			var out []models.AlertChannel
			for _, c := range store {
				if matches(c, t) {
					out = append(out, *c)
				}
			}
			return out, nil
		},
		GetChannelFunc: func(_ context.Context, t repositories.AlertTarget, id uuid.UUID) (*models.AlertChannel, error) {
			c, ok := store[id]
			if !ok || !matches(c, t) {
				return nil, gorm.ErrRecordNotFound
			}
			cp := *c
			return &cp, nil
		},
		CreateChannelFunc: func(_ context.Context, c *models.AlertChannel) error {
			cp := *c
			store[c.ID] = &cp
			return nil
		},
		UpdateChannelFunc: func(_ context.Context, c *models.AlertChannel) error {
			cp := *c
			store[c.ID] = &cp
			return nil
		},
		DeleteChannelFunc: func(_ context.Context, t repositories.AlertTarget, id uuid.UUID) (bool, error) {
			c, ok := store[id]
			if !ok || !matches(c, t) {
				return false, nil
			}
			delete(store, id)
			return true, nil
		},
		DeleteChannelsUnderFunc: func(context.Context, string, string, string) error { return nil },
	}
}

func newTestAlertChannelService(driver *fakeChannelDriver) (AlertChannelService, *repomocks.AlertChannelRepositoryMock) {
	repo := newAlertChannelRepoMock()
	svc := NewAlertChannelService(repo, alertchannels.NewRegistry(driver), testAlertKey, slog.New(slog.DiscardHandler))
	return svc, repo
}

func agentAlertTarget() repositories.AlertTarget {
	return repositories.AlertTarget{OUID: "ou-1", Scope: models.AlertScopeAgent, ProjectName: "p1", AgentName: "a1"}
}

func auditCtx(r *recordingAuditor) context.Context {
	return audit.WithRecorder(context.Background(), r)
}

func validAgentInput() AlertChannelInput {
	return AlertChannelInput{
		Name:         "  Prod deploys ",
		Kind:         "fake",
		Config:       json.RawMessage(`{"dest":"somewhere","ignored":true}`),
		Environments: []string{"production", "production", " "},
		EventTypes:   []string{"agent.deployed", "agent.deployed"},
		Enabled:      true,
	}
}

func TestAlertChannelService_CreateNormalisesAndAudits(t *testing.T) {
	driver := &fakeChannelDriver{hasSecret: true}
	svc, _ := newTestAlertChannelService(driver)
	rec := &recordingAuditor{}

	ch, secret, err := svc.Create(auditCtx(rec), agentAlertTarget(), validAgentInput())
	require.NoError(t, err)
	assert.Equal(t, "Prod deploys", ch.Name)
	assert.Equal(t, "fake", ch.Kind)
	assert.JSONEq(t, `{"dest":"somewhere"}`, string(ch.Config), "the driver normalises the config")
	assert.Equal(t, []string{"production"}, ch.Environments)
	assert.Equal(t, []string{"agent.deployed"}, ch.EventTypes)
	assert.NotEmpty(t, secret)
	assert.NotContains(t, string(ch.SecretEncrypted), secret, "the secret is stored encrypted")
	assert.Equal(t, []audit.Action{audit.ActionAlertChannelCreate, audit.ActionAlertChannelCreate}, rec.actions(),
		"intent and outcome are recorded")
}

func TestAlertChannelService_KindWithoutSecret(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	ctx := auditCtx(&recordingAuditor{})
	ch, secret, err := svc.Create(ctx, agentAlertTarget(), validAgentInput())
	require.NoError(t, err)
	assert.Empty(t, secret)
	assert.Empty(t, ch.SecretEncrypted)

	_, err = svc.RotateSecret(ctx, agentAlertTarget(), ch.ID)
	assert.ErrorIs(t, err, utils.ErrInvalidInput, "nothing to rotate")
}

func TestAlertChannelService_Validation(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	ctx := auditCtx(&recordingAuditor{})
	agent := agentAlertTarget()
	org := repositories.AlertTarget{OUID: "ou-1", Scope: models.AlertScopeOrg}

	cases := map[string]struct {
		target repositories.AlertTarget
		edit   func(*AlertChannelInput)
	}{
		"missing name":             {agent, func(in *AlertChannelInput) { in.Name = " " }},
		"unknown kind":             {agent, func(in *AlertChannelInput) { in.Kind = "carrier-pigeon" }},
		"invalid config":           {agent, func(in *AlertChannelInput) { in.Config = json.RawMessage(`{}`) }},
		"agent without env":        {agent, func(in *AlertChannelInput) { in.Environments = nil }},
		"event of another scope":   {agent, func(in *AlertChannelInput) { in.EventTypes = []string{"project.created"} }},
		"unknown event type":       {agent, func(in *AlertChannelInput) { in.EventTypes = []string{"agent.teleported"} }},
		"agent event on org scope": {org, func(in *AlertChannelInput) { in.EventTypes = []string{"agent.deployed"} }},
	}
	for name, tc := range cases {
		t.Run(name, func(t *testing.T) {
			in := validAgentInput()
			tc.edit(&in)
			_, _, err := svc.Create(ctx, tc.target, in)
			assert.ErrorIs(t, err, utils.ErrInvalidInput)
		})
	}

	in := validAgentInput()
	in.EventTypes = []string{"project.created"}
	ch, _, err := svc.Create(ctx, org, in)
	require.NoError(t, err)
	assert.Empty(t, ch.Environments, "org channels select no environment")
}

func TestAlertChannelService_UpdateCannotChangeKind(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	ctx := auditCtx(&recordingAuditor{})
	ch, _, err := svc.Create(ctx, agentAlertTarget(), validAgentInput())
	require.NoError(t, err)

	in := validAgentInput()
	in.Kind = "webhook"
	_, err = svc.Update(ctx, agentAlertTarget(), ch.ID, in)
	assert.ErrorIs(t, err, utils.ErrInvalidInput)

	in = validAgentInput()
	in.Enabled = false
	updated, err := svc.Update(ctx, agentAlertTarget(), ch.ID, in)
	require.NoError(t, err)
	assert.False(t, updated.Enabled)
}

func TestAlertChannelService_ScopeIsolation(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	ctx := auditCtx(&recordingAuditor{})
	ch, _, err := svc.Create(ctx, agentAlertTarget(), validAgentInput())
	require.NoError(t, err)

	other := agentAlertTarget()
	other.AgentName = "a2"
	_, err = svc.Get(ctx, other, ch.ID)
	assert.ErrorIs(t, err, utils.ErrAlertChannelNotFound)
	assert.ErrorIs(t, svc.Delete(ctx, other, ch.ID), utils.ErrAlertChannelNotFound)
	_, err = svc.RotateSecret(ctx, other, ch.ID)
	assert.ErrorIs(t, err, utils.ErrAlertChannelNotFound)
}

func TestAlertChannelService_AuditFailureBlocksTheChange(t *testing.T) {
	svc, repo := newTestAlertChannelService(&fakeChannelDriver{})
	rec := &recordingAuditor{fail: errors.New("sink down")}
	_, _, err := svc.Create(auditCtx(rec), agentAlertTarget(), validAgentInput())
	require.Error(t, err)
	assert.Empty(t, repo.CreateChannelCalls(), "nothing is stored without an audit record")
}

func TestAlertChannelService_TestSendsSignedTestEvent(t *testing.T) {
	driver := &fakeChannelDriver{hasSecret: true, result: alertchannels.Result{StatusCode: 503, Err: errors.New("down")}}
	svc, _ := newTestAlertChannelService(driver)
	ctx := auditCtx(&recordingAuditor{})
	ch, secret, err := svc.Create(ctx, agentAlertTarget(), validAgentInput())
	require.NoError(t, err)

	res, err := svc.Test(ctx, agentAlertTarget(), ch.ID)
	require.NoError(t, err)
	assert.False(t, res.Delivered)
	assert.Equal(t, 503, res.StatusCode)
	assert.Equal(t, "down", res.Error)

	require.Len(t, driver.msgs, 1)
	assert.Equal(t, secret, driver.sent[0].Secret, "the decrypted secret reaches the driver")
	assert.Equal(t, events.TypePrefix+events.TypeAlertingTest, driver.msgs[0].Type)
	var evt events.Event
	require.NoError(t, json.Unmarshal(driver.msgs[0].Body, &evt))
	assert.Equal(t, driver.msgs[0].ID, evt.ID)
	assert.Equal(t, "a1", evt.Agent)
}

func TestAlertChannelService_EventTypes(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	types, err := svc.EventTypes(models.AlertScopeAgent)
	require.NoError(t, err)
	require.NotEmpty(t, types)
	for _, ty := range types {
		assert.Equal(t, events.ScopeAgent, ty.Scope)
	}
	_, err = svc.EventTypes("galaxy")
	assert.ErrorIs(t, err, utils.ErrInvalidInput)
}

func TestAlertChannelService_RedactedConfig(t *testing.T) {
	svc, _ := newTestAlertChannelService(&fakeChannelDriver{})
	assert.JSONEq(t, `{"dest":"masked"}`, string(svc.RedactedConfig(&models.AlertChannel{Kind: "fake"})))
	assert.JSONEq(t, `{}`, string(svc.RedactedConfig(&models.AlertChannel{Kind: "unknown"})))
}
