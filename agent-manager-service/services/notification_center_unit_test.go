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
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wso2/agent-manager/agent-manager-service/config"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories/repomocks"
)

var testRunTime = time.Date(2026, 10, 21, 10, 0, 0, 0, time.UTC)

// monitorRunEventBytes builds a published monitor run event.
func monitorRunEventBytes(t *testing.T, name string, monitorID uuid.UUID, data map[string]any) []byte {
	t.Helper()
	e := events.New("evt_monrun_1", name, events.ScopeAgent, "ou-1", "proj", "agent", testRunTime)
	e.Environment = "dev"
	monitor := map[string]any{"id": monitorID.String(), "name": "quality", "displayName": "Quality"}
	payload := map[string]any{"monitor": monitor}
	for k, v := range data {
		payload[k] = v
	}
	e.Data = payload
	raw, err := json.Marshal(e)
	require.NoError(t, err)
	return raw
}

func scoresData(evaluator string, mean float64) map[string]any {
	return map[string]any{
		"run": map[string]any{"id": "run-1", "status": "success"},
		"scores": []map[string]any{{
			"evaluator": evaluator, "level": "trace", "aggregations": map[string]any{"mean": mean},
		}},
	}
}

func newTestNotificationCenter(repo *repomocks.NotificationRepositoryMock) *notificationCenter {
	return NewNotificationCenterService(nil, repo, config.Config{}, discardSlog()).(*notificationCenter)
}

func TestNotificationCenter_IgnoresOtherEvents(t *testing.T) {
	// A nil ListWatchesFunc panics if called: other events must not reach the
	// repository.
	center := newTestNotificationCenter(&repomocks.NotificationRepositoryMock{})
	e := events.New("evt_1", "project.created", events.ScopeProject, "ou-1", "proj", "", testRunTime)
	raw, err := json.Marshal(e)
	require.NoError(t, err)

	msg := &answeredMessage{data: raw}
	center.handleEvent(context.Background(), msg)
	assert.Equal(t, "ack", msg.outcome)
}

func TestNotificationCenter_NotifiesWatchersAndRecordsBreaches(t *testing.T) {
	monitorID := uuid.New()
	threshold := models.ScoreThreshold{
		Evaluator: "Helpfulness", Aggregation: "mean", Operator: models.ThresholdBelow, Value: 0.7,
	}
	watcher := models.MonitorWatch{
		ID: uuid.New(), OUID: "ou-1", MonitorID: monitorID, UserID: "alice",
		Thresholds: []models.ScoreThreshold{threshold},
	}
	// A watch from another org on the same monitor ID is never notified.
	stranger := models.MonitorWatch{
		ID: uuid.New(), OUID: "ou-2", MonitorID: monitorID, UserID: "mallory", NotifyOnSuccess: true,
	}

	var created []models.Notification
	var breached []string
	var evaluatedAt time.Time
	repo := &repomocks.NotificationRepositoryMock{
		ListWatchesFunc: func(_ context.Context, id uuid.UUID) ([]models.MonitorWatch, error) {
			assert.Equal(t, monitorID, id)
			return []models.MonitorWatch{watcher, stranger}, nil
		},
		CreateNotificationsFunc: func(_ context.Context, n []models.Notification) error {
			created = append(created, n...)
			return nil
		},
		UpdateWatchBreachedFunc: func(_ context.Context, id uuid.UUID, keys []string, at time.Time) error {
			assert.Equal(t, watcher.ID, id)
			breached, evaluatedAt = keys, at
			return nil
		},
	}
	center := newTestNotificationCenter(repo)

	msg := &answeredMessage{data: monitorRunEventBytes(t, events.TypeMonitorRunSucceeded, monitorID, scoresData("Helpfulness", 0.62))}
	center.handleEvent(context.Background(), msg)

	assert.Equal(t, "ack", msg.outcome)
	require.Len(t, created, 1)
	assert.Equal(t, "alice", created[0].UserID)
	assert.Equal(t, models.NotificationScoreBreached, created[0].Kind)
	assert.Equal(t, "evt_monrun_1", created[0].EventID)
	assert.Equal(t, "run-1", created[0].Target.RunID)
	assert.Equal(t, "dev", created[0].Target.EnvironmentName)
	assert.Equal(t, []string{threshold.Key()}, breached)
	assert.True(t, evaluatedAt.Equal(testRunTime))
}

func TestNotificationCenter_RetriesOnStoreErrors(t *testing.T) {
	monitorID := uuid.New()
	watch := models.MonitorWatch{ID: uuid.New(), OUID: "ou-1", MonitorID: monitorID, UserID: "alice", NotifyOnFailure: true}
	failed := monitorRunEventBytes(t, events.TypeMonitorRunFailed, monitorID,
		map[string]any{"run": map[string]any{"id": "run-1", "status": "failed", "error": "boom"}})

	t.Run("loading watches", func(t *testing.T) {
		repo := &repomocks.NotificationRepositoryMock{
			ListWatchesFunc: func(context.Context, uuid.UUID) ([]models.MonitorWatch, error) {
				return nil, errors.New("db down")
			},
		}
		msg := &answeredMessage{data: failed}
		newTestNotificationCenter(repo).handleEvent(context.Background(), msg)
		assert.Equal(t, "retry", msg.outcome)
	})

	t.Run("creating notifications", func(t *testing.T) {
		repo := &repomocks.NotificationRepositoryMock{
			ListWatchesFunc: func(context.Context, uuid.UUID) ([]models.MonitorWatch, error) {
				return []models.MonitorWatch{watch}, nil
			},
			CreateNotificationsFunc: func(context.Context, []models.Notification) error {
				return errors.New("db down")
			},
		}
		msg := &answeredMessage{data: failed}
		newTestNotificationCenter(repo).handleEvent(context.Background(), msg)
		assert.Equal(t, "retry", msg.outcome)
	})
}

func TestNotificationCenter_DropsMalformedEvents(t *testing.T) {
	msg := &answeredMessage{data: []byte("not json")}
	newTestNotificationCenter(&repomocks.NotificationRepositoryMock{}).handleEvent(context.Background(), msg)
	assert.Equal(t, "drop", msg.outcome)
}
