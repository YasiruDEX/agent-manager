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
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wso2/agent-manager/agent-manager-service/db"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

func TestEventDestinationRejectsStaleWrites(t *testing.T) {
	for _, first := range []string{"rotation", "settings"} {
		t.Run(first+" wins", func(t *testing.T) {
			ctx := context.Background()
			repo := NewEventRepository(db.GetDB())
			d := &models.EventDestination{
				ID: uuid.New(), OUID: "ou-" + uuid.NewString(), Name: "webhook",
				Kind:            models.DestinationKindWebhook,
				Config:          json.RawMessage(`{"url":"https://old.example.com"}`),
				SecretEncrypted: []byte("old-secret"),
				Availability:    models.DestinationAvailableAll, Projects: []string{},
			}
			require.NoError(t, repo.CreateDestination(ctx, d))
			t.Cleanup(func() { _, err := repo.DeleteDestination(ctx, d.OUID, d.ID); assert.NoError(t, err) })
			current, err := repo.GetDestination(ctx, d.OUID, d.ID)
			require.NoError(t, err)
			stale, err := repo.GetDestination(ctx, d.OUID, d.ID)
			require.NoError(t, err)
			if first == "rotation" {
				current.SecretEncrypted = []byte("new-secret")
				stale.Config = json.RawMessage(`{"url":"https://new.example.com"}`)
			} else {
				current.Config = json.RawMessage(`{"url":"https://new.example.com"}`)
				current.Availability = models.DestinationAvailableOrg
				stale.SecretEncrypted = []byte("new-secret")
			}
			require.NoError(t, repo.UpdateDestination(ctx, current, nil))
			checked := false
			err = repo.UpdateDestination(ctx, stale, func([]models.EventSubscription) error { checked = true; return nil })
			require.ErrorIs(t, err, utils.ErrConflict)
			assert.False(t, checked, "stale input is rejected before availability checks")
			saved, err := repo.GetDestination(ctx, d.OUID, d.ID)
			require.NoError(t, err)
			assert.Equal(t, current.SecretEncrypted, saved.SecretEncrypted)
			assert.JSONEq(t, string(current.Config), string(saved.Config))
			assert.Equal(t, current.Availability, saved.Availability)
			assert.True(t, current.UpdatedAt.Equal(saved.UpdatedAt), "returned revision matches PostgreSQL precision")

			// An edit based on the latest value succeeds without reverting
			// the secret or settings written by the first request.
			saved.Description = "fresh edit"
			require.NoError(t, repo.UpdateDestination(ctx, saved, nil))
			fresh, err := repo.GetDestination(ctx, d.OUID, d.ID)
			require.NoError(t, err)
			assert.Equal(t, "fresh edit", fresh.Description)
			assert.Equal(t, current.SecretEncrypted, fresh.SecretEncrypted)
			assert.JSONEq(t, string(current.Config), string(fresh.Config))
		})
	}
}
