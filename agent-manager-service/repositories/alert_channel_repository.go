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

	"github.com/wso2/agent-manager/agent-manager-service/models"
)

// AlertTarget selects the alert channels of one scope: an org, a project, or
// an agent. Fields below the scope are ignored.
type AlertTarget struct {
	OUID        string
	Scope       string
	ProjectName string
	AgentName   string
}

// AlertChannelRepository persists alert channels.
//
//go:generate moq -rm -fmt goimports -skip-ensure -pkg repomocks -out repomocks/alert_channel_repository_mock.go . AlertChannelRepository:AlertChannelRepositoryMock
type AlertChannelRepository interface {
	ListChannels(ctx context.Context, target AlertTarget) ([]models.AlertChannel, error)
	// GetChannel returns the channel with id within target, or
	// gorm.ErrRecordNotFound.
	GetChannel(ctx context.Context, target AlertTarget, id uuid.UUID) (*models.AlertChannel, error)
	CreateChannel(ctx context.Context, channel *models.AlertChannel) error
	UpdateChannel(ctx context.Context, channel *models.AlertChannel) error
	DeleteChannel(ctx context.Context, target AlertTarget, id uuid.UUID) (bool, error)
	// DeleteChannelsUnder removes the channels of a deleted project (agent
	// empty) or agent.
	DeleteChannelsUnder(ctx context.Context, ouID, projectName, agentName string) error
}

type alertChannelRepository struct {
	db *gorm.DB
}

// NewAlertChannelRepository creates an AlertChannelRepository.
func NewAlertChannelRepository(db *gorm.DB) AlertChannelRepository {
	return &alertChannelRepository{db: db}
}

func (r *alertChannelRepository) scoped(ctx context.Context, t AlertTarget) *gorm.DB {
	q := r.db.WithContext(ctx).Where("ou_id = ? AND scope = ?", t.OUID, t.Scope)
	switch t.Scope {
	case models.AlertScopeProject:
		q = q.Where("project_name = ?", t.ProjectName)
	case models.AlertScopeAgent:
		q = q.Where("project_name = ? AND agent_name = ?", t.ProjectName, t.AgentName)
	}
	return q
}

func (r *alertChannelRepository) ListChannels(ctx context.Context, t AlertTarget) ([]models.AlertChannel, error) {
	var out []models.AlertChannel
	if err := r.scoped(ctx, t).Order("created_at ASC").Find(&out).Error; err != nil {
		return nil, err
	}
	return out, nil
}

func (r *alertChannelRepository) GetChannel(ctx context.Context, t AlertTarget, id uuid.UUID) (*models.AlertChannel, error) {
	var c models.AlertChannel
	if err := r.scoped(ctx, t).Where("id = ?", id).First(&c).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *alertChannelRepository) CreateChannel(ctx context.Context, c *models.AlertChannel) error {
	now := time.Now()
	c.CreatedAt, c.UpdatedAt = now, now
	return r.db.WithContext(ctx).Create(c).Error
}

func (r *alertChannelRepository) UpdateChannel(ctx context.Context, c *models.AlertChannel) error {
	c.UpdatedAt = time.Now()
	// Update from the struct, not a map, so the JSON columns go through their
	// serializers; Select also writes zero values such as enabled=false.
	return r.db.WithContext(ctx).Model(&models.AlertChannel{}).Where("id = ?", c.ID).
		Select("name", "description", "config", "environments", "event_types", "enabled", "secret_encrypted", "updated_at").
		Updates(c).Error
}

func (r *alertChannelRepository) DeleteChannel(ctx context.Context, t AlertTarget, id uuid.UUID) (bool, error) {
	res := r.scoped(ctx, t).Where("id = ?", id).Delete(&models.AlertChannel{})
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}

func (r *alertChannelRepository) DeleteChannelsUnder(ctx context.Context, ouID, projectName, agentName string) error {
	q := r.db.WithContext(ctx).Where("ou_id = ? AND project_name = ?", ouID, projectName)
	if agentName != "" {
		q = q.Where("agent_name = ?", agentName)
	}
	return q.Delete(&models.AlertChannel{}).Error
}
