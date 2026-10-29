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
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
)

const (
	notificationFanoutConsumer   = events.NotificationFanoutConsumer
	notificationFanoutRetryDelay = 5 * time.Second
	notificationPruneInterval    = time.Hour
)

// NotificationCenterService turns monitor run events into console
// notifications for the users who watch the monitor.
//
// It reads every published event through its own durable consumer, so it
// sees each event independently of the event dispatcher; across replicas each
// event goes to one of them. A notification is created at most once per
// user, event and kind, so an event redelivered after a crash is harmless.
type NotificationCenterService interface {
	Start(ctx context.Context) error
	Stop() error
}

type notificationCenter struct {
	bus    events.Bus
	repo   repositories.NotificationRepository
	cfg    config.NotificationsConfig
	logger *slog.Logger
	now    func() time.Time

	sub    events.Subscription
	wg     sync.WaitGroup
	cancel context.CancelFunc
}

// NewNotificationCenterService creates the notification center. bus may be
// nil (events off), in which case Start does nothing.
func NewNotificationCenterService(
	bus events.Bus,
	repo repositories.NotificationRepository,
	cfg config.Config,
	logger *slog.Logger,
) NotificationCenterService {
	return &notificationCenter{
		bus:    bus,
		repo:   repo,
		cfg:    cfg.Notifications,
		logger: logger.With("component", "notification-center"),
		now:    time.Now,
	}
}

func (n *notificationCenter) Start(ctx context.Context) error {
	if n.bus == nil {
		n.logger.Info("Notification center not started: events are off")
		return nil
	}
	runCtx, cancel := context.WithCancel(ctx)
	n.cancel = cancel

	sub, err := n.bus.SubscribeEvents(runCtx, notificationFanoutConsumer, func(msg events.Message) {
		n.handleEvent(runCtx, msg)
	})
	if err != nil {
		cancel()
		return fmt.Errorf("failed to consume events: %w", err)
	}
	n.sub = sub

	n.wg.Add(1)
	go n.pruneLoop(runCtx)

	n.logger.Info("Notification center started")
	return nil
}

func (n *notificationCenter) Stop() error {
	if n.cancel != nil {
		n.cancel()
	}
	if n.sub != nil {
		n.sub.Stop()
	}
	n.wg.Wait()
	return nil
}

// handleEvent notifies the watchers of the monitor a run event is about.
func (n *notificationCenter) handleEvent(ctx context.Context, msg events.Message) {
	var e events.Event
	if err := json.Unmarshal(msg.Data(), &e); err != nil || e.ID == "" {
		n.logger.Error("Dropping malformed event", "error", err)
		_ = msg.Drop()
		return
	}
	run, ok := parseMonitorRunEvent(e, msg.Data())
	if !ok {
		_ = msg.Ack() // not about a monitor run
		return
	}
	log := n.logger.With("eventId", e.ID, "monitorId", run.MonitorID)

	watches, err := n.repo.ListWatches(ctx, run.MonitorID)
	if err != nil {
		log.Error("Failed to load monitor watches; will retry", "error", err)
		_ = msg.Retry(notificationFanoutRetryDelay)
		return
	}
	for i := range watches {
		w := &watches[i]
		if w.OUID != run.OrgID {
			continue
		}
		err := n.repo.WithWatch(ctx, w.ID, func(current *models.MonitorWatch, txRepo repositories.NotificationRepository) error {
			if current.OUID != run.OrgID {
				return nil
			}
			outcome := evaluateWatch(current, run)
			if err := txRepo.CreateNotifications(ctx, outcome.Notifications); err != nil {
				return err
			}
			if outcome.Evaluated {
				return txRepo.UpdateWatchBreached(ctx, current.ID, outcome.Breached, run.Time)
			}
			return nil
		})
		if err != nil {
			log.Error("Failed to evaluate monitor watch; will retry", "watchId", w.ID, "error", err)
			_ = msg.Retry(notificationFanoutRetryDelay)
			return
		}
	}
	_ = msg.Ack()
}

func (n *notificationCenter) pruneLoop(ctx context.Context) {
	defer n.wg.Done()
	ticker := time.NewTicker(notificationPruneInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			days := max(n.cfg.RetentionDays, 1)
			cutoff := n.now().Add(-time.Duration(days) * 24 * time.Hour)
			if count, err := n.repo.PruneNotifications(ctx, cutoff); err != nil {
				n.logger.Error("Failed to prune notifications", "error", err)
			} else if count > 0 {
				n.logger.Info("Pruned notifications", "count", count)
			}
		}
	}
}
