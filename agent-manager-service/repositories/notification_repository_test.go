//go:build integration

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
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wso2/agent-manager/agent-manager-service/db"
	"github.com/wso2/agent-manager/agent-manager-service/models"
)

func notificationWatchFixture(t *testing.T) (NotificationRepository, *models.MonitorWatch) {
	t.Helper()
	conn := db.GetDB()
	monitor := &models.Monitor{
		ID: uuid.New(), Name: "watch-" + uuid.NewString(), OUID: "ou-" + uuid.NewString(),
		ProjectName: "project", AgentName: "agent", Type: models.MonitorTypeFuture,
		EnvironmentName: "development",
	}
	require.NoError(t, conn.Create(monitor).Error)
	repo := NewNotificationRepository(conn)
	watch := &models.MonitorWatch{
		OUID: monitor.OUID, MonitorID: monitor.ID, UserID: "user-" + uuid.NewString(),
		Thresholds: []models.ScoreThreshold{{Evaluator: "quality", Aggregation: "mean", Operator: "below", Value: 0.7}},
		Breached:   []string{},
	}
	t.Cleanup(func() {
		assert.NoError(t, conn.Where("ou_id = ?", watch.OUID).Delete(&models.Notification{}).Error)
		assert.NoError(t, conn.Delete(monitor).Error)
	})
	require.NoError(t, repo.SaveWatch(context.Background(), watch))
	return repo, watch
}

func TestNotificationWithWatchRollsBackAllWrites(t *testing.T) {
	repo, watch := notificationWatchFixture(t)
	ctx := context.Background()
	failure := errors.New("evaluation aborted")
	err := repo.WithWatch(ctx, watch.ID, func(w *models.MonitorWatch, tx NotificationRepository) error {
		if err := tx.CreateNotifications(ctx, []models.Notification{{
			OUID: w.OUID, UserID: w.UserID, Kind: models.NotificationScoreBreached,
			EventID: "evt-" + uuid.NewString(), Title: "breached",
		}}); err != nil {
			return err
		}
		if err := tx.UpdateWatchBreached(ctx, w.ID, []string{w.Thresholds[0].Key()}, time.Now()); err != nil {
			return err
		}
		return failure
	})
	require.ErrorIs(t, err, failure)
	current, err := repo.GetWatch(ctx, watch.MonitorID, watch.UserID)
	require.NoError(t, err)
	assert.Empty(t, current.Breached)
	assert.Nil(t, current.LastEvaluatedAt)
	_, total, err := repo.ListNotifications(ctx, watch.OUID, watch.UserID, false, 10, 0)
	require.NoError(t, err)
	assert.Zero(t, total)
}

func TestNotificationWithWatchSerializesEvaluations(t *testing.T) {
	repo, watch := notificationWatchFixture(t)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	locked := make(chan struct{})
	release := make(chan struct{})
	firstDone := make(chan error, 1)
	go func() {
		firstDone <- repo.WithWatch(ctx, watch.ID, func(w *models.MonitorWatch, tx NotificationRepository) error {
			close(locked)
			select {
			case <-release:
			case <-ctx.Done():
				return ctx.Err()
			}
			return tx.UpdateWatchBreached(ctx, w.ID, []string{w.Thresholds[0].Key()}, time.Now())
		})
	}()
	select {
	case <-locked:
	case <-ctx.Done():
		t.Fatal(ctx.Err())
	}
	secondEntered := make(chan []string, 1)
	secondDone := make(chan error, 1)
	go func() {
		secondDone <- repo.WithWatch(ctx, watch.ID, func(w *models.MonitorWatch, _ NotificationRepository) error {
			secondEntered <- w.Breached
			return nil
		})
	}()
	select {
	case <-secondEntered:
		t.Error("second evaluation bypassed first watch lock")
	case <-time.After(100 * time.Millisecond):
	}
	close(release)
	require.NoError(t, <-firstDone)
	require.NoError(t, <-secondDone)
	select {
	case breached := <-secondEntered:
		assert.Equal(t, []string{watch.Thresholds[0].Key()}, breached)
	case <-ctx.Done():
		t.Fatal(ctx.Err())
	}
}

func TestNotificationSaveWatchUsesCurrentBreaches(t *testing.T) {
	repo, watch := notificationWatchFixture(t)
	ctx := context.Background()
	at := time.Now().UTC().Truncate(time.Microsecond)
	require.NoError(t, repo.UpdateWatchBreached(ctx, watch.ID, []string{watch.Thresholds[0].Key(), "removed-threshold"}, at))
	// The caller read before the evaluation and sends an empty state. Only
	// settings are accepted; evaluation state comes from the locked row.
	watch.NotifyOnSuccess = true
	watch.Breached = []string{}
	originalID, createdAt := watch.ID, watch.CreatedAt
	require.NoError(t, repo.SaveWatch(ctx, watch))
	assert.Equal(t, originalID, watch.ID)
	assert.True(t, createdAt.Equal(watch.CreatedAt))
	assert.Equal(t, []string{watch.Thresholds[0].Key()}, watch.Breached)
	require.NotNil(t, watch.LastEvaluatedAt)
	assert.True(t, at.Equal(*watch.LastEvaluatedAt))
	stored, err := repo.GetWatch(ctx, watch.MonitorID, watch.UserID)
	require.NoError(t, err)
	assert.Equal(t, watch.ID, stored.ID)
	assert.Equal(t, watch.Breached, stored.Breached)
	assert.Equal(t, watch.Thresholds, stored.Thresholds)
	assert.True(t, stored.NotifyOnSuccess)
	assert.True(t, watch.UpdatedAt.Equal(stored.UpdatedAt))
	assert.True(t, watch.CreatedAt.Equal(stored.CreatedAt))
	assert.True(t, watch.LastEvaluatedAt.Equal(*stored.LastEvaluatedAt))
}
