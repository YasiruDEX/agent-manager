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
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories/repomocks"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

var testMonitorRef = MonitorRef{OUID: "ou-1", ProjectName: "proj", AgentName: "agent", MonitorName: "quality"}

func monitorRepoWith(m *models.Monitor, err error) *repomocks.MonitorRepositoryMock {
	return &repomocks.MonitorRepositoryMock{
		GetMonitorByNameFunc: func(string, string, string, string) (*models.Monitor, error) {
			return m, err
		},
	}
}

func testMonitor() *models.Monitor {
	return &models.Monitor{
		ID: uuid.New(), OUID: "ou-1", Name: "quality",
		Evaluators: []models.MonitorEvaluator{{Identifier: "helpfulness", DisplayName: "Helpfulness"}},
	}
}

func TestNotificationService_MonitorLookupErrors(t *testing.T) {
	t.Run("missing monitor is not found", func(t *testing.T) {
		svc := NewNotificationService(&repomocks.NotificationRepositoryMock{}, monitorRepoWith(nil, gorm.ErrRecordNotFound))
		_, _, err := svc.GetWatch(context.Background(), testMonitorRef, "alice")
		assert.ErrorIs(t, err, utils.ErrMonitorNotFound)
	})
	t.Run("a database error is not masked as not found", func(t *testing.T) {
		svc := NewNotificationService(&repomocks.NotificationRepositoryMock{}, monitorRepoWith(nil, errors.New("db down")))
		err := svc.DeleteWatch(context.Background(), testMonitorRef, "alice")
		require.Error(t, err)
		assert.NotErrorIs(t, err, utils.ErrMonitorNotFound)
	})
}

func TestNotificationService_GetWatchWhenNotWatching(t *testing.T) {
	repo := &repomocks.NotificationRepositoryMock{
		GetWatchFunc: func(context.Context, uuid.UUID, string) (*models.MonitorWatch, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	svc := NewNotificationService(repo, monitorRepoWith(testMonitor(), nil))
	w, found, err := svc.GetWatch(context.Background(), testMonitorRef, "alice")
	require.NoError(t, err)
	assert.False(t, found)
	assert.Nil(t, w)
}

func TestNotificationService_SaveWatchValidatesThresholds(t *testing.T) {
	valid := models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "mean", Operator: "below", Value: 0.7}
	tests := []struct {
		name      string
		threshold models.ScoreThreshold
	}{
		{"unknown evaluator", models.ScoreThreshold{Evaluator: "Nope", Aggregation: "mean", Operator: "below", Value: 0.5}},
		{"unknown aggregation", models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "p99", Operator: "below", Value: 0.5}},
		{"unknown operator", models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "mean", Operator: "equals", Value: 0.5}},
		{"value out of range", models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "mean", Operator: "below", Value: 1.5}},
		{"repeats another threshold", models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "mean", Operator: "below", Value: 0.2}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// SaveWatchFunc is nil: an invalid watch must not be stored.
			svc := NewNotificationService(&repomocks.NotificationRepositoryMock{}, monitorRepoWith(testMonitor(), nil))
			_, err := svc.SaveWatch(context.Background(), testMonitorRef, "alice", MonitorWatchSettings{
				Thresholds: []models.ScoreThreshold{valid, tt.threshold},
			})
			assert.ErrorIs(t, err, utils.ErrInvalidInput)
		})
	}
}

func TestNotificationService_SaveWatchKeepsUnchangedBreaches(t *testing.T) {
	kept := models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "mean", Operator: "below", Value: 0.7}
	removed := models.ScoreThreshold{Evaluator: "Helpfulness", Aggregation: "pass_rate", Operator: "below", Value: 0.5}
	m := testMonitor()

	var saved *models.MonitorWatch
	repo := &repomocks.NotificationRepositoryMock{
		GetWatchFunc: func(context.Context, uuid.UUID, string) (*models.MonitorWatch, error) {
			return &models.MonitorWatch{Breached: []string{kept.Key(), removed.Key()}}, nil
		},
		SaveWatchFunc: func(_ context.Context, w *models.MonitorWatch) error {
			saved = w
			return nil
		},
	}
	svc := NewNotificationService(repo, monitorRepoWith(m, nil))
	_, err := svc.SaveWatch(context.Background(), testMonitorRef, "alice", MonitorWatchSettings{
		NotifyOnFailure: true, Thresholds: []models.ScoreThreshold{kept},
	})
	require.NoError(t, err)
	require.NotNil(t, saved)
	assert.Equal(t, m.ID, saved.MonitorID)
	assert.Equal(t, "ou-1", saved.OUID, "the watch belongs to the monitor's org")
	assert.Equal(t, "alice", saved.UserID)
	assert.Equal(t, []string{kept.Key()}, saved.Breached)
}

func TestNotificationService_SetRead(t *testing.T) {
	id := uuid.New()

	t.Run("read sets a time, unread clears it", func(t *testing.T) {
		var got []*time.Time
		repo := &repomocks.NotificationRepositoryMock{
			SetReadFunc: func(_ context.Context, ouID, userID string, gotID uuid.UUID, readAt *time.Time) (*models.Notification, error) {
				assert.Equal(t, "ou-1", ouID)
				assert.Equal(t, "alice", userID)
				assert.Equal(t, id, gotID)
				got = append(got, readAt)
				return &models.Notification{ID: id, ReadAt: readAt}, nil
			},
		}
		svc := NewNotificationService(repo, &repomocks.MonitorRepositoryMock{})
		_, err := svc.SetRead(context.Background(), "ou-1", "alice", id, true)
		require.NoError(t, err)
		_, err = svc.SetRead(context.Background(), "ou-1", "alice", id, false)
		require.NoError(t, err)
		require.Len(t, got, 2)
		assert.NotNil(t, got[0])
		assert.Nil(t, got[1])
	})

	t.Run("another user's notification is not found", func(t *testing.T) {
		repo := &repomocks.NotificationRepositoryMock{
			SetReadFunc: func(context.Context, string, string, uuid.UUID, *time.Time) (*models.Notification, error) {
				return nil, gorm.ErrRecordNotFound
			},
		}
		_, err := NewNotificationService(repo, &repomocks.MonitorRepositoryMock{}).
			SetRead(context.Background(), "ou-1", "bob", id, true)
		assert.ErrorIs(t, err, utils.ErrNotificationNotFound)
	})
}
