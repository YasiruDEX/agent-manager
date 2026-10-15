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
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories/repomocks"
	"github.com/wso2/agent-manager/agent-manager-service/services/alertchannels"
	"github.com/wso2/agent-manager/agent-manager-service/services/alertchannels/webhook"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

// queueBus is a Bus with no transport behind it, to drive the dispatcher's
// handlers directly. It shows the dispatcher needs only the Bus interface.
type queueBus struct {
	enqueued map[string][]byte
}

func (f *queueBus) Setup(context.Context) error                              { return nil }
func (f *queueBus) PublishEvent(context.Context, events.Event, []byte) error { return nil }
func (f *queueBus) SubscribeEvents(context.Context, string, func(events.Message)) (events.Subscription, error) {
	return stopNoop{}, nil
}

func (f *queueBus) Enqueue(_ context.Context, _ string, key string, body []byte) error {
	f.enqueued[key] = body
	return nil
}

func (f *queueBus) Consume(context.Context, string, string, func(events.Message)) (events.Subscription, error) {
	return stopNoop{}, nil
}
func (f *queueBus) Close() {}

type stopNoop struct{}

func (stopNoop) Stop() {}

// answeredMessage records how the dispatcher answered it.
type answeredMessage struct {
	data    []byte
	attempt int
	outcome string
	delay   time.Duration
}

func (m *answeredMessage) Data() []byte { return m.data }
func (m *answeredMessage) Attempt() int { return m.attempt }
func (m *answeredMessage) Ack() error   { m.outcome = "ack"; return nil }
func (m *answeredMessage) Retry(d time.Duration) error {
	m.outcome, m.delay = "retry", d
	return nil
}
func (m *answeredMessage) Drop() error { m.outcome = "drop"; return nil }

func discardSlog() *slog.Logger { return slog.New(slog.DiscardHandler) }

func TestAlertDispatcher_FanOutAndRetryDecisions(t *testing.T) {
	ch := models.AlertChannel{
		ID: uuid.New(), OUID: "ou-1", Scope: models.AlertScopeOrg, Kind: "fake",
		Config: json.RawMessage(`{"dest":"x"}`), EventTypes: []string{"project.created"}, Enabled: true,
	}
	other := ch
	other.ID = uuid.New()
	other.EventTypes = []string{"project.deleted"}

	var mu sync.Mutex
	recorded := map[string]models.AlertDelivery{}
	status := ""
	repo := &repomocks.AlertChannelRepositoryMock{
		MatchingChannelsFunc: func(context.Context, string, string, string, string, string) ([]models.AlertChannel, error) {
			return []models.AlertChannel{ch, other}, nil
		},
		GetChannelByIDFunc: func(context.Context, uuid.UUID) (*models.AlertChannel, error) {
			c := ch
			return &c, nil
		},
		RecordQueuedDeliveryFunc: func(context.Context, *models.AlertDelivery) error { return nil },
		RecordDeliveryFunc: func(_ context.Context, d *models.AlertDelivery) error {
			mu.Lock()
			defer mu.Unlock()
			recorded[d.Status] = *d
			return nil
		},
		DeliveryStatusFunc: func(context.Context, uuid.UUID, string) (string, error) {
			if status == "" {
				return "", gorm.ErrRecordNotFound
			}
			return status, nil
		},
	}
	driver := &fakeChannelDriver{}
	resolver := NewAlertChannelService(repo, alertchannels.NewRegistry(driver), testAlertKey, discardSlog())
	bus := &queueBus{enqueued: map[string][]byte{}}
	d := NewAlertDispatcherService(bus, repo, resolver,
		config.Config{Alerting: config.AlertingConfig{MaxAttempts: 3}}, discardSlog()).(*alertDispatcher)
	ctx := context.Background()

	// Fan-out queues one delivery, for the subscribed channel only.
	evt, _ := json.Marshal(events.New("evt_1", "project.created", events.ScopeOrg, "ou-1", "", "", time.Now()))
	in := &answeredMessage{data: evt, attempt: 1}
	d.handleEvent(ctx, in)
	assert.Equal(t, "ack", in.outcome)
	require.Len(t, bus.enqueued, 1)
	body := bus.enqueued["evt_1:"+ch.ID.String()]
	require.NotNil(t, body)

	// A retryable failure is retried with the first backoff step.
	driver.result = alertchannels.Result{StatusCode: http.StatusServiceUnavailable, Err: errors.New("down"), Retryable: true}
	m := &answeredMessage{data: body, attempt: 1}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "retry", m.outcome)
	assert.Equal(t, alertRetryBackoff[0], m.delay)
	assert.Equal(t, 1, recorded[models.AlertDeliveryPending].Attempts)

	// The last attempt gives up.
	m = &answeredMessage{data: body, attempt: 3}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "drop", m.outcome)
	assert.Equal(t, 3, recorded[models.AlertDeliveryFailed].Attempts)

	// A failure the driver calls final is not retried.
	driver.result = alertchannels.Result{StatusCode: http.StatusNotFound, Err: errors.New("gone")}
	m = &answeredMessage{data: body, attempt: 1}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "drop", m.outcome)

	// Success is recorded as delivered.
	driver.result = alertchannels.Result{StatusCode: http.StatusOK}
	m = &answeredMessage{data: body, attempt: 2}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "ack", m.outcome)
	assert.NotNil(t, recorded[models.AlertDeliveryDelivered].DeliveredAt)

	// A job whose delivery is already recorded as delivered is not sent again.
	status = models.AlertDeliveryDelivered
	sent := len(driver.msgs)
	m = &answeredMessage{data: body, attempt: 3}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "ack", m.outcome)
	assert.Len(t, driver.msgs, sent, "no second send")

	// A deleted channel drops the job.
	status = ""
	repo.GetChannelByIDFunc = func(context.Context, uuid.UUID) (*models.AlertChannel, error) { return nil, gorm.ErrRecordNotFound }
	m = &answeredMessage{data: body, attempt: 1}
	d.handleDelivery(ctx, m)
	assert.Equal(t, "drop", m.outcome)
}

func TestAlertDispatcher_StartWithoutBusIsANoop(t *testing.T) {
	d := NewAlertDispatcherService(nil, &repomocks.AlertChannelRepositoryMock{}, nil, config.Config{}, discardSlog())
	require.NoError(t, d.Start(context.Background()))
	require.NoError(t, d.Stop())
}

// End to end over JetStream: an event is published, fanned out to the
// matching channel only, signed by the webhook driver, retried after a 503 and
// recorded as delivered. Runs on the embedded in-memory server; set
// NATS_TEST_URL (e.g. nats://localhost:4222) to use a real NATS server.
func TestAlertDispatcher_EndToEndOverNATS(t *testing.T) {
	saved := alertRetryBackoff
	alertRetryBackoff = []time.Duration{200 * time.Millisecond}
	t.Cleanup(func() { alertRetryBackoff = saved })

	var mu sync.Mutex
	var received []*http.Request
	var bodies [][]byte
	calls := 0
	receiver := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)
		mu.Lock()
		defer mu.Unlock()
		calls++
		if calls == 1 {
			w.WriteHeader(http.StatusServiceUnavailable) // the first attempt fails
			return
		}
		received = append(received, r.Clone(context.Background()))
		bodies = append(bodies, body)
	}))
	defer receiver.Close()

	secret := webhook.SecretPrefix + base64.StdEncoding.EncodeToString([]byte("test-signing-key-for-unit-tests!"))
	encrypted, err := utils.EncryptBytes([]byte(secret), testAlertKey)
	require.NoError(t, err)
	ou := "ou-" + uuid.NewString()[:8]
	cfgJSON, _ := json.Marshal(webhook.Config{URL: receiver.URL})
	match := models.AlertChannel{
		ID: uuid.New(), OUID: ou, Scope: models.AlertScopeAgent, ProjectName: "p1", AgentName: "a1",
		Environments: []string{"dev"}, Kind: models.AlertChannelKindWebhook, Config: cfgJSON,
		EventTypes: []string{"agent.deployed"}, Enabled: true, SecretEncrypted: encrypted,
	}
	unsubscribed := match
	unsubscribed.ID = uuid.New()
	unsubscribed.EventTypes = []string{"agent.updated"}

	var recMu sync.Mutex
	recorded := map[uuid.UUID]models.AlertDelivery{}
	repo := &repomocks.AlertChannelRepositoryMock{
		MatchingChannelsFunc: func(_ context.Context, ouID, scope, project, agent, env string) ([]models.AlertChannel, error) {
			if ouID == ou && scope == "agent" && project == "p1" && agent == "a1" && env == "dev" {
				return []models.AlertChannel{match, unsubscribed}, nil
			}
			return nil, nil
		},
		GetChannelByIDFunc: func(context.Context, uuid.UUID) (*models.AlertChannel, error) {
			c := match
			return &c, nil
		},
		RecordQueuedDeliveryFunc: func(context.Context, *models.AlertDelivery) error { return nil },
		RecordDeliveryFunc: func(_ context.Context, d *models.AlertDelivery) error {
			recMu.Lock()
			defer recMu.Unlock()
			recorded[d.ChannelID] = *d
			return nil
		},
		DeliveryStatusFunc:  func(context.Context, uuid.UUID, string) (string, error) { return "", gorm.ErrRecordNotFound },
		PruneDeliveriesFunc: func(context.Context, time.Time) (int64, error) { return 0, nil },
	}

	var bus *events.NATSBus
	if natsURL := os.Getenv("NATS_TEST_URL"); natsURL != "" {
		bus, err = events.Connect(natsURL, "dispatcher-test", discardSlog())
	} else {
		bus, err = events.StartEmbedded(discardSlog())
	}
	require.NoError(t, err)
	defer bus.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	require.NoError(t, bus.Setup(ctx))

	cfg := config.Config{Alerting: config.AlertingConfig{MaxAttempts: 3, AllowPrivateEndpoints: true}}
	resolver := NewAlertChannelService(repo, alertchannels.NewRegistry(webhook.New(true)), testAlertKey, discardSlog())
	d := NewAlertDispatcherService(bus, repo, resolver, cfg, discardSlog())
	require.NoError(t, d.Start(ctx))
	defer func() { _ = d.Stop() }()

	pub := events.NewAsyncPublisher(bus, discardSlog())
	pub.Start()
	evt := events.New("evt_"+uuid.NewString(), "agent.deployed", events.ScopeAgent, ou, "p1", "a1", time.Now())
	evt.Environment = "dev"
	evt.Data = map[string]any{"imageId": "img-1"}
	pub.Publish(ctx, evt)
	pub.Publish(ctx, evt) // a duplicate publish is dropped by JetStream
	pub.Stop()

	require.Eventually(t, func() bool {
		mu.Lock()
		defer mu.Unlock()
		return len(received) == 1
	}, 30*time.Second, 200*time.Millisecond)
	time.Sleep(time.Second) // nothing further arrives

	mu.Lock()
	defer mu.Unlock()
	require.Len(t, received, 1, "one delivery: the duplicate publish and the unsubscribed channel send nothing")
	req, body := received[0], bodies[0]
	assert.Equal(t, evt.ID, req.Header.Get(webhook.HeaderID))
	assert.Equal(t, "com.wso2.agentmanager.agent.deployed", req.Header.Get(webhook.HeaderEventType))
	assert.Equal(t, events.MediaType, req.Header.Get("Content-Type"))
	ts, _ := strconv.ParseInt(req.Header.Get(webhook.HeaderTimestamp), 10, 64)
	want, err := webhook.Sign(secret, evt.ID, time.Unix(ts, 0), body)
	require.NoError(t, err)
	assert.Equal(t, want, req.Header.Get(webhook.HeaderSignature), "the signature verifies")

	var got events.Event
	require.NoError(t, json.Unmarshal(body, &got))
	assert.Equal(t, "img-1", got.Data.(map[string]any)["imageId"])

	recMu.Lock()
	defer recMu.Unlock()
	d1 := recorded[match.ID]
	assert.Equal(t, models.AlertDeliveryDelivered, d1.Status)
	assert.Equal(t, 2, d1.Attempts)
	_, sentToUnsubscribed := recorded[unsubscribed.ID]
	assert.False(t, sentToUnsubscribed)
}
