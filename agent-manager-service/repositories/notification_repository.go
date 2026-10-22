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

package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/wso2/agent-manager/agent-manager-service/models"
)

// NotificationRepository persists users' monitor watches and their console
// notifications. Every inbox query is bound to one user in one org.
//
//go:generate moq -rm -fmt goimports -skip-ensure -pkg repomocks -out repomocks/notification_repository_mock.go . NotificationRepository:NotificationRepositoryMock
type NotificationRepository interface {
	// GetWatch returns a user's watch on a monitor, or gorm.ErrRecordNotFound.
	GetWatch(ctx context.Context, monitorID uuid.UUID, userID string) (*models.MonitorWatch, error)
	// SaveWatch creates or replaces a user's watch on a monitor.
	SaveWatch(ctx context.Context, watch *models.MonitorWatch) error
	DeleteWatch(ctx context.Context, monitorID uuid.UUID, userID string) error
	// ListWatches returns every watch on a monitor, for the notification
	// center.
	ListWatches(ctx context.Context, monitorID uuid.UUID) ([]models.MonitorWatch, error)
	// UpdateWatchBreached records the thresholds a run breached, unless a
	// newer run was already evaluated.
	UpdateWatchBreached(ctx context.Context, watchID uuid.UUID, breached []string, evaluatedAt time.Time) error

	// CreateNotifications adds notifications, skipping any already created
	// for the same user, event and kind.
	CreateNotifications(ctx context.Context, notifications []models.Notification) error
	// ListNotifications returns a user's notifications, newest first, and how
	// many match ignoring limit and offset.
	ListNotifications(ctx context.Context, ouID, userID string, unreadOnly bool, limit, offset int) ([]models.Notification, int64, error)
	CountUnread(ctx context.Context, ouID, userID string) (int64, error)
	// SetRead marks one of a user's notifications read (at readAt) or unread
	// (readAt nil). Returns gorm.ErrRecordNotFound when the user has no such
	// notification.
	SetRead(ctx context.Context, ouID, userID string, id uuid.UUID, readAt *time.Time) (*models.Notification, error)
	MarkAllRead(ctx context.Context, ouID, userID string, readAt time.Time) error
	// PruneNotifications deletes notifications created before cutoff.
	PruneNotifications(ctx context.Context, cutoff time.Time) (int64, error)
}

type notificationRepository struct {
	db *gorm.DB
}

// NewNotificationRepository creates a NotificationRepository.
func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) GetWatch(ctx context.Context, monitorID uuid.UUID, userID string) (*models.MonitorWatch, error) {
	var w models.MonitorWatch
	err := r.db.WithContext(ctx).Where("monitor_id = ? AND user_id = ?", monitorID, userID).First(&w).Error
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *notificationRepository) SaveWatch(ctx context.Context, w *models.MonitorWatch) error {
	now := time.Now()
	w.CreatedAt, w.UpdatedAt = now, now
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "monitor_id"}, {Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"notify_on_failure", "notify_on_success", "thresholds", "breached", "updated_at",
		}),
	}).Create(w).Error
}

func (r *notificationRepository) DeleteWatch(ctx context.Context, monitorID uuid.UUID, userID string) error {
	return r.db.WithContext(ctx).Where("monitor_id = ? AND user_id = ?", monitorID, userID).
		Delete(&models.MonitorWatch{}).Error
}

func (r *notificationRepository) ListWatches(ctx context.Context, monitorID uuid.UUID) ([]models.MonitorWatch, error) {
	var out []models.MonitorWatch
	if err := r.db.WithContext(ctx).Where("monitor_id = ?", monitorID).Find(&out).Error; err != nil {
		return nil, err
	}
	return out, nil
}

func (r *notificationRepository) UpdateWatchBreached(
	ctx context.Context, watchID uuid.UUID, breached []string, evaluatedAt time.Time,
) error {
	// Update from the struct so breached goes through its JSON serializer.
	return r.db.WithContext(ctx).Model(&models.MonitorWatch{}).
		Where("id = ? AND (last_evaluated_at IS NULL OR last_evaluated_at < ?)", watchID, evaluatedAt).
		Select("breached", "last_evaluated_at").
		Updates(&models.MonitorWatch{Breached: breached, LastEvaluatedAt: &evaluatedAt}).Error
}

func (r *notificationRepository) CreateNotifications(ctx context.Context, notifications []models.Notification) error {
	if len(notifications) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "event_id"}, {Name: "kind"}},
		DoNothing: true,
	}).Create(&notifications).Error
}

func (r *notificationRepository) inbox(ctx context.Context, ouID, userID string) *gorm.DB {
	return r.db.WithContext(ctx).Model(&models.Notification{}).Where("ou_id = ? AND user_id = ?", ouID, userID)
}

func (r *notificationRepository) ListNotifications(
	ctx context.Context, ouID, userID string, unreadOnly bool, limit, offset int,
) ([]models.Notification, int64, error) {
	q := r.inbox(ctx, ouID, userID)
	if unreadOnly {
		q = q.Where("read_at IS NULL")
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var out []models.Notification
	if err := q.Order("created_at DESC, id DESC").Limit(limit).Offset(offset).Find(&out).Error; err != nil {
		return nil, 0, err
	}
	return out, total, nil
}

func (r *notificationRepository) CountUnread(ctx context.Context, ouID, userID string) (int64, error) {
	var n int64
	err := r.inbox(ctx, ouID, userID).Where("read_at IS NULL").Count(&n).Error
	return n, err
}

func (r *notificationRepository) SetRead(
	ctx context.Context, ouID, userID string, id uuid.UUID, readAt *time.Time,
) (*models.Notification, error) {
	res := r.inbox(ctx, ouID, userID).Where("id = ?", id).Update("read_at", readAt)
	if res.Error != nil {
		return nil, res.Error
	}
	if res.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	var n models.Notification
	if err := r.inbox(ctx, ouID, userID).Where("id = ?", id).First(&n).Error; err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *notificationRepository) MarkAllRead(ctx context.Context, ouID, userID string, readAt time.Time) error {
	return r.inbox(ctx, ouID, userID).Where("read_at IS NULL").Update("read_at", readAt).Error
}

func (r *notificationRepository) PruneNotifications(ctx context.Context, cutoff time.Time) (int64, error) {
	res := r.db.WithContext(ctx).Where("created_at < ?", cutoff).Delete(&models.Notification{})
	return res.RowsAffected, res.Error
}
