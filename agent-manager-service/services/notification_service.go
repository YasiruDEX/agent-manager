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
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

// MonitorRef names a monitor by its place in the org.
type MonitorRef struct {
	OUID        string
	ProjectName string
	AgentName   string
	MonitorName string
}

// MonitorWatchSettings is what a user asks to be notified about.
type MonitorWatchSettings struct {
	NotifyOnFailure bool
	NotifyOnSuccess bool
	Thresholds      []models.ScoreThreshold
}

// NotificationService manages users' monitor watches and their console
// notifications. Every operation acts for one user, who can only see and
// change their own.
type NotificationService interface {
	// GetWatch returns the user's watch on the monitor; found is false when
	// they do not watch it.
	GetWatch(ctx context.Context, ref MonitorRef, userID string) (watch *models.MonitorWatch, found bool, err error)
	SaveWatch(ctx context.Context, ref MonitorRef, userID string, settings MonitorWatchSettings) (*models.MonitorWatch, error)
	DeleteWatch(ctx context.Context, ref MonitorRef, userID string) error

	List(ctx context.Context, ouID, userID string, unreadOnly bool, limit, offset int) ([]models.Notification, int64, error)
	UnreadCount(ctx context.Context, ouID, userID string) (int64, error)
	SetRead(ctx context.Context, ouID, userID string, id uuid.UUID, read bool) (*models.Notification, error)
	MarkAllRead(ctx context.Context, ouID, userID string) error
}

type notificationService struct {
	repo        repositories.NotificationRepository
	monitorRepo repositories.MonitorRepository
	now         func() time.Time
}

// NewNotificationService creates a NotificationService.
func NewNotificationService(
	repo repositories.NotificationRepository,
	monitorRepo repositories.MonitorRepository,
) NotificationService {
	return &notificationService{repo: repo, monitorRepo: monitorRepo, now: time.Now}
}

func (s *notificationService) monitor(ref MonitorRef) (*models.Monitor, error) {
	m, err := s.monitorRepo.GetMonitorByName(ref.OUID, ref.ProjectName, ref.AgentName, ref.MonitorName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, utils.ErrMonitorNotFound
		}
		return nil, fmt.Errorf("failed to get monitor: %w", err)
	}
	return m, nil
}

func (s *notificationService) GetWatch(
	ctx context.Context, ref MonitorRef, userID string,
) (*models.MonitorWatch, bool, error) {
	m, err := s.monitor(ref)
	if err != nil {
		return nil, false, err
	}
	w, err := s.repo.GetWatch(ctx, m.ID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, fmt.Errorf("failed to get monitor watch: %w", err)
	}
	return w, true, nil
}

func (s *notificationService) SaveWatch(
	ctx context.Context, ref MonitorRef, userID string, settings MonitorWatchSettings,
) (*models.MonitorWatch, error) {
	m, err := s.monitor(ref)
	if err != nil {
		return nil, err
	}
	if err := validateThresholds(m, settings.Thresholds); err != nil {
		return nil, err
	}
	// Keep what the latest run breached for the thresholds that did not
	// change, so saving the settings does not repeat their notifications.
	var breached []string
	if prev, err := s.repo.GetWatch(ctx, m.ID, userID); err == nil {
		current := make(map[string]bool, len(settings.Thresholds))
		for _, t := range settings.Thresholds {
			current[t.Key()] = true
		}
		for _, k := range prev.Breached {
			if current[k] {
				breached = append(breached, k)
			}
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to get monitor watch: %w", err)
	}
	if breached == nil {
		breached = []string{}
	}
	thresholds := settings.Thresholds
	if thresholds == nil {
		thresholds = []models.ScoreThreshold{}
	}
	w := &models.MonitorWatch{
		OUID:            m.OUID,
		MonitorID:       m.ID,
		UserID:          userID,
		NotifyOnFailure: settings.NotifyOnFailure,
		NotifyOnSuccess: settings.NotifyOnSuccess,
		Thresholds:      thresholds,
		Breached:        breached,
	}
	if err := s.repo.SaveWatch(ctx, w); err != nil {
		return nil, fmt.Errorf("failed to save monitor watch: %w", err)
	}
	return w, nil
}

// validateThresholds checks each threshold names one of the monitor's
// evaluators and a supported comparison, and that none repeats another.
func validateThresholds(m *models.Monitor, thresholds []models.ScoreThreshold) error {
	if len(thresholds) > models.MaxMonitorThresholds {
		return fmt.Errorf("%w: at most %d thresholds are allowed", utils.ErrInvalidInput, models.MaxMonitorThresholds)
	}
	evaluators := make(map[string]bool, len(m.Evaluators))
	for _, e := range m.Evaluators {
		evaluators[e.DisplayName] = true
	}
	seen := make(map[string]bool, len(thresholds))
	for i, t := range thresholds {
		switch {
		case !evaluators[t.Evaluator]:
			return fmt.Errorf("%w: thresholds[%d]: %q is not an evaluator of this monitor", utils.ErrInvalidInput, i, t.Evaluator)
		case t.Aggregation != models.ThresholdAggregationMean && t.Aggregation != models.ThresholdAggregationPassRate:
			return fmt.Errorf("%w: thresholds[%d]: aggregation must be mean or pass_rate", utils.ErrInvalidInput, i)
		case t.Operator != models.ThresholdBelow && t.Operator != models.ThresholdAbove:
			return fmt.Errorf("%w: thresholds[%d]: operator must be below or above", utils.ErrInvalidInput, i)
		case t.Value < 0 || t.Value > 1:
			return fmt.Errorf("%w: thresholds[%d]: value must be between 0 and 1", utils.ErrInvalidInput, i)
		}
		key := t.Evaluator + "|" + t.Aggregation + "|" + t.Operator
		if seen[key] {
			return fmt.Errorf("%w: thresholds[%d]: repeats another threshold", utils.ErrInvalidInput, i)
		}
		seen[key] = true
	}
	return nil
}

func (s *notificationService) DeleteWatch(ctx context.Context, ref MonitorRef, userID string) error {
	m, err := s.monitor(ref)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteWatch(ctx, m.ID, userID); err != nil {
		return fmt.Errorf("failed to delete monitor watch: %w", err)
	}
	return nil
}

func (s *notificationService) List(
	ctx context.Context, ouID, userID string, unreadOnly bool, limit, offset int,
) ([]models.Notification, int64, error) {
	out, total, err := s.repo.ListNotifications(ctx, ouID, userID, unreadOnly, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list notifications: %w", err)
	}
	return out, total, nil
}

func (s *notificationService) UnreadCount(ctx context.Context, ouID, userID string) (int64, error) {
	n, err := s.repo.CountUnread(ctx, ouID, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread notifications: %w", err)
	}
	return n, nil
}

func (s *notificationService) SetRead(
	ctx context.Context, ouID, userID string, id uuid.UUID, read bool,
) (*models.Notification, error) {
	var readAt *time.Time
	if read {
		now := s.now()
		readAt = &now
	}
	n, err := s.repo.SetRead(ctx, ouID, userID, id, readAt)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, utils.ErrNotificationNotFound
		}
		return nil, fmt.Errorf("failed to update notification: %w", err)
	}
	return n, nil
}

func (s *notificationService) MarkAllRead(ctx context.Context, ouID, userID string) error {
	if err := s.repo.MarkAllRead(ctx, ouID, userID, s.now()); err != nil {
		return fmt.Errorf("failed to mark notifications read: %w", err)
	}
	return nil
}
