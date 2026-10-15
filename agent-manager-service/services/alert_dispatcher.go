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
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
	"github.com/wso2/agent-manager/agent-manager-service/services/alertchannels"
)

const (
	alertFanoutConsumer   = "alert-fanout"
	alertDeliveryConsumer = "alert-delivery"
	alertFanoutRetryDelay = 5 * time.Second
	alertDeliveryWorkers  = 8
	alertPruneInterval    = time.Hour
)

// alertRetryBackoff is the delay before each retry; attempts beyond its
// length reuse the last delay.
var alertRetryBackoff = []time.Duration{
	10 * time.Second,
	1 * time.Minute,
	5 * time.Minute,
	30 * time.Minute,
	2 * time.Hour,
}

// alertDeliveryJob is one message on the deliveries queue: an event bound for
// one channel.
type alertDeliveryJob struct {
	ChannelID string          `json:"channelId"`
	Event     json.RawMessage `json:"event"`
}

// AlertDispatcherService consumes published events and delivers them to the
// matching alert channels.
//
// It runs in two stages so one slow or failing channel does not hold up, or
// cause duplicates at, the others. The fan-out stage reads each event, finds
// the channels subscribed to it and queues one delivery per channel. The
// delivery stage hands each one to the channel kind's driver, retrying with
// backoff until it succeeds or runs out of attempts. The work lives on the
// events.Bus, so every replica can run the dispatcher: each message goes to
// one of them.
type AlertDispatcherService interface {
	Start(ctx context.Context) error
	Stop() error
}

type alertDispatcher struct {
	bus      events.Bus
	repo     repositories.AlertChannelRepository
	resolver AlertChannelResolver
	cfg      config.AlertingConfig
	logger   *slog.Logger
	now      func() time.Time

	subs    []events.Subscription
	workers chan struct{}
	wg      sync.WaitGroup
	cancel  context.CancelFunc
}

// NewAlertDispatcherService creates the dispatcher. bus may be nil (events
// off), in which case Start does nothing.
func NewAlertDispatcherService(
	bus events.Bus,
	repo repositories.AlertChannelRepository,
	resolver AlertChannelResolver,
	cfg config.Config,
	logger *slog.Logger,
) AlertDispatcherService {
	return &alertDispatcher{
		bus:      bus,
		repo:     repo,
		resolver: resolver,
		cfg:      cfg.Alerting,
		logger:   logger.With("component", "alert-dispatcher"),
		now:      time.Now,
		workers:  make(chan struct{}, alertDeliveryWorkers),
	}
}

func (d *alertDispatcher) Start(ctx context.Context) error {
	if d.bus == nil {
		d.logger.Info("Alert dispatcher not started: events are off")
		return nil
	}
	runCtx, cancel := context.WithCancel(ctx)
	d.cancel = cancel

	fanout, err := d.bus.SubscribeEvents(runCtx, alertFanoutConsumer, func(msg events.Message) {
		d.handleEvent(runCtx, msg)
	})
	if err != nil {
		cancel()
		return fmt.Errorf("failed to consume events: %w", err)
	}
	delivery, err := d.bus.Consume(runCtx, events.QueueAlertDeliveries, alertDeliveryConsumer,
		func(msg events.Message) {
			// Deliveries run on a bounded pool so one slow channel does not
			// stall the rest; the pool blocks the consumer when every worker
			// is busy.
			d.workers <- struct{}{}
			d.wg.Add(1)
			go func() {
				defer func() { <-d.workers; d.wg.Done() }()
				d.handleDelivery(runCtx, msg)
			}()
		})
	if err != nil {
		fanout.Stop()
		cancel()
		return fmt.Errorf("failed to consume alert deliveries: %w", err)
	}
	d.subs = []events.Subscription{fanout, delivery}

	d.wg.Add(1)
	go d.pruneLoop(runCtx)

	d.logger.Info("Alert dispatcher started", "maxAttempts", d.maxAttempts())
	return nil
}

func (d *alertDispatcher) Stop() error {
	for _, sub := range d.subs {
		sub.Stop()
	}
	if d.cancel != nil {
		d.cancel()
	}
	d.wg.Wait()
	return nil
}

// handleEvent fans one event out to its channels.
func (d *alertDispatcher) handleEvent(ctx context.Context, msg events.Message) {
	var e events.Event
	if err := json.Unmarshal(msg.Data(), &e); err != nil || e.ID == "" || e.OrgID == "" {
		d.logger.Error("Dropping malformed event", "error", err)
		_ = msg.Drop()
		return
	}
	log := d.logger.With("eventId", e.ID, "type", e.Name())

	channels, err := d.repo.MatchingChannels(ctx, e.OrgID, string(e.Scope), e.Project, e.Agent, e.Environment)
	if err != nil {
		log.Error("Failed to find alert channels; will retry", "error", err)
		_ = msg.Retry(alertFanoutRetryDelay)
		return
	}
	for i := range channels {
		ch := &channels[i]
		if !ch.Subscribes(e.Name()) {
			continue
		}
		// Recorded before it is queued: a delivery worker can finish before
		// this handler continues, and its outcome must not be overwritten.
		if err := d.repo.RecordQueuedDelivery(ctx, &models.AlertDelivery{
			ChannelID: ch.ID, OUID: ch.OUID, EventID: e.ID, EventType: e.Name(),
			Status: models.AlertDeliveryPending,
		}); err != nil {
			log.Error("Failed to record alert delivery; will retry", "channelId", ch.ID, "error", err)
			_ = msg.Retry(alertFanoutRetryDelay)
			return
		}
		body, err := json.Marshal(alertDeliveryJob{ChannelID: ch.ID.String(), Event: msg.Data()})
		if err != nil {
			log.Error("Failed to encode alert delivery", "channelId", ch.ID, "error", err)
			continue
		}
		// The key makes a repeated fan-out of the same event (after a crash
		// before the ack) a no-op for channels already queued.
		if err := d.bus.Enqueue(ctx, events.QueueAlertDeliveries, e.ID+":"+ch.ID.String(), body); err != nil {
			log.Error("Failed to queue alert delivery; will retry", "channelId", ch.ID, "error", err)
			_ = msg.Retry(alertFanoutRetryDelay)
			return
		}
	}
	_ = msg.Ack()
}

// handleDelivery delivers one event to one channel.
func (d *alertDispatcher) handleDelivery(ctx context.Context, msg events.Message) {
	var job alertDeliveryJob
	if err := json.Unmarshal(msg.Data(), &job); err != nil {
		d.logger.Error("Dropping malformed alert delivery", "error", err)
		_ = msg.Drop()
		return
	}
	channelID, err := uuid.Parse(job.ChannelID)
	if err != nil {
		d.logger.Error("Dropping alert delivery with an invalid channel ID", "channelId", job.ChannelID)
		_ = msg.Drop()
		return
	}
	var head events.Event
	_ = json.Unmarshal(job.Event, &head)
	// The delivery log keeps the short catalog name; the message carries the
	// full CloudEvents type.
	eventName := head.Name()

	ch, err := d.repo.GetChannelByID(ctx, channelID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			_ = msg.Drop() // channel deleted since the event was queued
			return
		}
		d.logger.Error("Failed to load alert channel; will retry", "channelId", channelID, "error", err)
		_ = msg.Retry(alertFanoutRetryDelay)
		return
	}
	// A delivery already recorded as delivered is not sent again: the job
	// came back because its acknowledgement was lost, not because it failed.
	if status, err := d.repo.DeliveryStatus(ctx, ch.ID, head.ID); err == nil && status == models.AlertDeliveryDelivered {
		_ = msg.Ack()
		return
	}
	if !ch.Enabled {
		d.record(ctx, ch, head.ID, eventName, models.AlertDeliveryFailed, 0, nil, "channel disabled", nil)
		_ = msg.Drop()
		return
	}
	driver, dest, err := d.resolver.Resolve(ch)
	if err != nil {
		d.record(ctx, ch, head.ID, eventName, models.AlertDeliveryFailed, 0, nil, "channel settings unreadable", nil)
		d.logger.Error("Cannot deliver to alert channel", "channelId", ch.ID, "error", err)
		_ = msg.Drop()
		return
	}

	attempt := msg.Attempt()
	res := driver.Deliver(ctx, dest, alertchannels.Message{ID: head.ID, Type: head.Type, Body: job.Event})
	var code *int
	if res.StatusCode != 0 {
		code = &res.StatusCode
	}
	if res.Err == nil {
		now := d.now()
		d.record(ctx, ch, head.ID, eventName, models.AlertDeliveryDelivered, attempt, code, "", &now)
		_ = msg.Ack()
		return
	}
	if attempt >= d.maxAttempts() || !res.Retryable {
		d.record(ctx, ch, head.ID, eventName, models.AlertDeliveryFailed, attempt, code, res.Err.Error(), nil)
		d.logger.Warn("Alert delivery failed", "channelId", ch.ID, "kind", ch.Kind, "eventId", head.ID,
			"attempts", attempt, "error", res.Err)
		_ = msg.Drop()
		return
	}
	d.record(ctx, ch, head.ID, eventName, models.AlertDeliveryPending, attempt, code, res.Err.Error(), nil)
	_ = msg.Retry(alertBackoff(attempt))
}

func (d *alertDispatcher) maxAttempts() int {
	return max(d.cfg.MaxAttempts, 1)
}

func alertBackoff(attempt int) time.Duration {
	if attempt < 1 {
		attempt = 1
	}
	if attempt > len(alertRetryBackoff) {
		return alertRetryBackoff[len(alertRetryBackoff)-1]
	}
	return alertRetryBackoff[attempt-1]
}

func (d *alertDispatcher) record(
	ctx context.Context, ch *models.AlertChannel, eventID, eventType, status string,
	attempts int, code *int, lastErr string, deliveredAt *time.Time,
) {
	err := d.repo.RecordDelivery(ctx, &models.AlertDelivery{
		ChannelID:    ch.ID,
		OUID:         ch.OUID,
		EventID:      eventID,
		EventType:    eventType,
		Status:       status,
		Attempts:     attempts,
		ResponseCode: code,
		LastError:    lastErr,
		DeliveredAt:  deliveredAt,
	})
	if err != nil {
		d.logger.Error("Failed to record alert delivery", "channelId", ch.ID, "eventId", eventID, "error", err)
	}
}

func (d *alertDispatcher) pruneLoop(ctx context.Context) {
	defer d.wg.Done()
	ticker := time.NewTicker(alertPruneInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			days := max(d.cfg.DeliveryRetentionDays, 1)
			cutoff := d.now().Add(-time.Duration(days) * 24 * time.Hour)
			if n, err := d.repo.PruneDeliveries(ctx, cutoff); err != nil {
				d.logger.Error("Failed to prune alert deliveries", "error", err)
			} else if n > 0 {
				d.logger.Info("Pruned alert deliveries", "count", n)
			}
		}
	}
}
