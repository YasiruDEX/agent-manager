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

package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Alert channel scopes.
const (
	AlertScopeOrg     = "org"
	AlertScopeProject = "project"
	AlertScopeAgent   = "agent"
)

// Alert channel kinds. A kind decides how events are delivered; each has a
// driver in services/alertchannels.
const (
	AlertChannelKindWebhook = "webhook"
	// AlertChannelKindNotify delivers a text notification to a chat, email,
	// paging or push service through the Shoutrrr library.
	AlertChannelKindNotify = "notify"
)

// Alert delivery statuses.
const (
	AlertDeliveryPending   = "pending"
	AlertDeliveryDelivered = "delivered"
	AlertDeliveryFailed    = "failed"
)

// AlertChannel receives the events it subscribes to. Its scope decides which
// events can reach it: org channels get org events, project channels get
// their project's events, agent channels get their agent's events in the
// environments they select. Its kind decides how they are delivered.
type AlertChannel struct {
	ID           uuid.UUID `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	OUID         string    `gorm:"column:ou_id;not null" json:"ouId"`
	Scope        string    `gorm:"column:scope;not null" json:"scope"`
	ProjectName  string    `gorm:"column:project_name;not null" json:"projectName"`
	AgentName    string    `gorm:"column:agent_name;not null" json:"agentName"`
	Environments []string  `gorm:"column:environments;type:jsonb;serializer:json;not null" json:"environments"`
	Name         string    `gorm:"column:name;not null" json:"name"`
	Description  string    `gorm:"column:description;not null" json:"description"`
	Kind         string    `gorm:"column:kind;not null" json:"kind"`
	// Config holds the kind's non-secret settings, e.g. {"url": "..."}.
	Config     json.RawMessage `gorm:"column:config;type:jsonb;not null" json:"config"`
	EventTypes []string        `gorm:"column:event_types;type:jsonb;serializer:json;not null" json:"eventTypes"`
	Enabled    bool            `gorm:"column:enabled;not null" json:"enabled"`
	// SecretEncrypted holds the kind's secret, if it has one: a webhook's
	// signing secret, say. Never returned by the API after creation.
	SecretEncrypted []byte    `gorm:"column:secret_encrypted" json:"-"`
	CreatedBy       string    `gorm:"column:created_by;not null" json:"createdBy"`
	CreatedAt       time.Time `gorm:"column:created_at;not null;default:NOW()" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"column:updated_at;not null;default:NOW()" json:"updatedAt"`
}

func (AlertChannel) TableName() string { return "alert_channels" }

// Subscribes reports whether the channel wants an event type.
func (c *AlertChannel) Subscribes(eventType string) bool {
	for _, t := range c.EventTypes {
		if t == eventType {
			return true
		}
	}
	return false
}

// AlertDelivery is the outcome of delivering one event to one channel.
type AlertDelivery struct {
	ID           uuid.UUID  `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	ChannelID    uuid.UUID  `gorm:"column:channel_id;type:uuid;not null" json:"channelId"`
	OUID         string     `gorm:"column:ou_id;not null" json:"ouId"`
	EventID      string     `gorm:"column:event_id;not null" json:"eventId"`
	EventType    string     `gorm:"column:event_type;not null" json:"eventType"`
	Status       string     `gorm:"column:status;not null" json:"status"`
	Attempts     int        `gorm:"column:attempts;not null" json:"attempts"`
	ResponseCode *int       `gorm:"column:response_code" json:"responseCode,omitempty"`
	LastError    string     `gorm:"column:last_error;not null" json:"lastError,omitempty"`
	DeliveredAt  *time.Time `gorm:"column:delivered_at" json:"deliveredAt,omitempty"`
	CreatedAt    time.Time  `gorm:"column:created_at;not null;default:NOW()" json:"createdAt"`
	UpdatedAt    time.Time  `gorm:"column:updated_at;not null;default:NOW()" json:"updatedAt"`
}

func (AlertDelivery) TableName() string { return "alert_deliveries" }
