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
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/wso2/agent-manager/agent-manager-service/audit"
	"github.com/wso2/agent-manager/agent-manager-service/events"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
	"github.com/wso2/agent-manager/agent-manager-service/services/alertchannels"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

const (
	maxAlertChannelsPerTarget = 10
	maxAlertChannelNameLength = 100
	maxAlertChannelDescLength = 500
	alertTestEventMessage     = "Test event from WSO2 Agent Manager. No action is needed."
)

// AlertChannelInput is the input for creating or updating an alert channel.
type AlertChannelInput struct {
	Name        string
	Description string
	// Kind decides how events are delivered; it cannot change on update.
	Kind string
	// Config is the kind's settings, validated by its driver.
	Config json.RawMessage
	// Environments are the environments an agent channel receives events of:
	// at least one is required for agent channels, none for others.
	Environments []string
	EventTypes   []string
	Enabled      bool
}

// AlertChannelTestResult is the outcome of a test send.
type AlertChannelTestResult struct {
	Delivered  bool
	StatusCode int
	Error      string
}

// AlertChannelCleaner removes the alert channels of a deleted project or
// agent, so one created later under the same name does not inherit them.
type AlertChannelCleaner interface {
	RemoveForProject(ctx context.Context, ouID, projectName string)
	RemoveForAgent(ctx context.Context, ouID, projectName, agentName string)
}

// AlertChannelService manages alert channels at org, project and agent scope.
// Every change is recorded fail-closed in the audit trail before it applies.
type AlertChannelService interface {
	// EventTypes lists the event types channels of a scope can subscribe to;
	// all of them for an empty scope.
	EventTypes(scope string) ([]events.Type, error)
	List(ctx context.Context, target repositories.AlertTarget) ([]models.AlertChannel, error)
	Get(ctx context.Context, target repositories.AlertTarget, id uuid.UUID) (*models.AlertChannel, error)
	// Create returns the new channel and its generated secret, if its kind
	// has one. The secret is shown once and never again.
	Create(ctx context.Context, target repositories.AlertTarget, in AlertChannelInput) (*models.AlertChannel, string, error)
	Update(ctx context.Context, target repositories.AlertTarget, id uuid.UUID, in AlertChannelInput) (*models.AlertChannel, error)
	Delete(ctx context.Context, target repositories.AlertTarget, id uuid.UUID) error
	// RotateSecret replaces the channel's generated secret and returns it.
	RotateSecret(ctx context.Context, target repositories.AlertTarget, id uuid.UUID) (string, error)
	// Test sends an alerting.test event straight to the channel.
	Test(ctx context.Context, target repositories.AlertTarget, id uuid.UUID) (*AlertChannelTestResult, error)
	// RedactedConfig masks the parts of a channel's settings that may carry a
	// credential, for callers who may see the channel but not change it.
	RedactedConfig(channel *models.AlertChannel) json.RawMessage

	AlertChannelCleaner
}

type alertChannelService struct {
	repo          repositories.AlertChannelRepository
	drivers       *alertchannels.Registry
	encryptionKey []byte
	logger        *slog.Logger
	now           func() time.Time
}

// NewAlertChannelService creates an AlertChannelService.
func NewAlertChannelService(
	repo repositories.AlertChannelRepository, drivers *alertchannels.Registry, encryptionKey []byte, logger *slog.Logger,
) AlertChannelService {
	return &alertChannelService{repo: repo, drivers: drivers, encryptionKey: encryptionKey, logger: logger, now: time.Now}
}

func (s *alertChannelService) EventTypes(scope string) ([]events.Type, error) {
	if scope != "" && !events.Scope(scope).Valid() {
		return nil, fmt.Errorf("%w: scope must be org, project or agent", utils.ErrInvalidInput)
	}
	return events.Types(events.Scope(scope)), nil
}

func (s *alertChannelService) List(ctx context.Context, t repositories.AlertTarget) ([]models.AlertChannel, error) {
	out, err := s.repo.ListChannels(ctx, t)
	if err != nil {
		return nil, fmt.Errorf("failed to list alert channels: %w", err)
	}
	return out, nil
}

func (s *alertChannelService) Get(ctx context.Context, t repositories.AlertTarget, id uuid.UUID) (*models.AlertChannel, error) {
	c, err := s.repo.GetChannel(ctx, t, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, utils.ErrAlertChannelNotFound
		}
		return nil, fmt.Errorf("failed to get alert channel: %w", err)
	}
	return c, nil
}

func (s *alertChannelService) Create(
	ctx context.Context, t repositories.AlertTarget, in AlertChannelInput,
) (*models.AlertChannel, string, error) {
	driver, err := s.validate(ctx, t, &in)
	if err != nil {
		return nil, "", err
	}
	existing, err := s.repo.ListChannels(ctx, t)
	if err != nil {
		return nil, "", fmt.Errorf("failed to list alert channels: %w", err)
	}
	if len(existing) >= maxAlertChannelsPerTarget {
		return nil, "", fmt.Errorf("%w: at most %d alert channels are allowed here", utils.ErrInvalidInput, maxAlertChannelsPerTarget)
	}
	secret, encrypted, err := s.newSecret(driver)
	if err != nil {
		return nil, "", err
	}
	c := &models.AlertChannel{
		ID:              uuid.New(),
		OUID:            t.OUID,
		Scope:           t.Scope,
		ProjectName:     t.ProjectName,
		AgentName:       t.AgentName,
		Environments:    in.Environments,
		Name:            in.Name,
		Description:     in.Description,
		Kind:            in.Kind,
		Config:          in.Config,
		EventTypes:      in.EventTypes,
		Enabled:         in.Enabled,
		SecretEncrypted: encrypted,
		CreatedBy:       audit.BuildEvent(ctx, audit.ActionAlertChannelCreate).ActorID,
	}
	attempt, err := audit.Begin(ctx, audit.ActionAlertChannelCreate, s.auditOpts(t, c, driver)...)
	if err != nil {
		return nil, "", err
	}
	if err := s.repo.CreateChannel(ctx, c); err != nil {
		err = fmt.Errorf("failed to create alert channel: %w", err)
		attempt.Complete(ctx, err)
		return nil, "", err
	}
	attempt.Complete(ctx, nil)
	return c, secret, nil
}

func (s *alertChannelService) Update(
	ctx context.Context, t repositories.AlertTarget, id uuid.UUID, in AlertChannelInput,
) (*models.AlertChannel, error) {
	c, err := s.Get(ctx, t, id)
	if err != nil {
		return nil, err
	}
	if in.Kind != c.Kind {
		return nil, fmt.Errorf("%w: the kind of an alert channel cannot be changed", utils.ErrInvalidInput)
	}
	driver, err := s.validate(ctx, t, &in)
	if err != nil {
		return nil, err
	}
	c.Name, c.Description, c.Config = in.Name, in.Description, in.Config
	c.Environments, c.EventTypes, c.Enabled = in.Environments, in.EventTypes, in.Enabled
	attempt, err := audit.Begin(ctx, audit.ActionAlertChannelUpdate, s.auditOpts(t, c, driver)...)
	if err != nil {
		return nil, err
	}
	if err := s.repo.UpdateChannel(ctx, c); err != nil {
		err = fmt.Errorf("failed to update alert channel: %w", err)
		attempt.Complete(ctx, err)
		return nil, err
	}
	attempt.Complete(ctx, nil)
	return c, nil
}

func (s *alertChannelService) Delete(ctx context.Context, t repositories.AlertTarget, id uuid.UUID) error {
	c, err := s.Get(ctx, t, id)
	if err != nil {
		return err
	}
	driver, _ := s.drivers.Get(c.Kind)
	attempt, err := audit.Begin(ctx, audit.ActionAlertChannelDelete, s.auditOpts(t, c, driver)...)
	if err != nil {
		return err
	}
	deleted, err := s.repo.DeleteChannel(ctx, t, id)
	switch {
	case err != nil:
		err = fmt.Errorf("failed to delete alert channel: %w", err)
	case !deleted:
		err = utils.ErrAlertChannelNotFound
	}
	attempt.Complete(ctx, err)
	return err
}

func (s *alertChannelService) RotateSecret(ctx context.Context, t repositories.AlertTarget, id uuid.UUID) (string, error) {
	c, err := s.Get(ctx, t, id)
	if err != nil {
		return "", err
	}
	driver, ok := s.drivers.Get(c.Kind)
	if !ok {
		return "", fmt.Errorf("%w: alert channel kind %q is not supported", utils.ErrInvalidInput, c.Kind)
	}
	secret, encrypted, err := s.newSecret(driver)
	if err != nil {
		return "", err
	}
	if secret == "" {
		return "", fmt.Errorf("%w: %s alert channels have no generated secret", utils.ErrInvalidInput, c.Kind)
	}
	attempt, err := audit.Begin(ctx, audit.ActionAlertChannelRotateSecret, s.auditOpts(t, c, driver)...)
	if err != nil {
		return "", err
	}
	c.SecretEncrypted = encrypted
	if err := s.repo.UpdateChannel(ctx, c); err != nil {
		err = fmt.Errorf("failed to rotate alert channel secret: %w", err)
		attempt.Complete(ctx, err)
		return "", err
	}
	attempt.Complete(ctx, nil)
	return secret, nil
}

func (s *alertChannelService) Test(ctx context.Context, t repositories.AlertTarget, id uuid.UUID) (*AlertChannelTestResult, error) {
	c, err := s.Get(ctx, t, id)
	if err != nil {
		return nil, err
	}
	driver, dest, err := s.Resolve(c)
	if err != nil {
		return nil, err
	}
	evt := events.New("evt_"+uuid.NewString(), events.TypeAlertingTest, events.Scope(c.Scope),
		c.OUID, c.ProjectName, c.AgentName, s.now())
	evt.Subject = c.ID.String()
	evt.Data = map[string]any{"message": alertTestEventMessage, "channelId": c.ID.String()}
	body, err := json.Marshal(evt)
	if err != nil {
		return nil, fmt.Errorf("failed to encode test event: %w", err)
	}
	res := driver.Deliver(ctx, dest, alertchannels.Message{ID: evt.ID, Type: evt.Type, Body: body})
	out := &AlertChannelTestResult{Delivered: res.Err == nil, StatusCode: res.StatusCode}
	if res.Err != nil {
		out.Error = res.Err.Error()
	}
	return out, nil
}

func (s *alertChannelService) RedactedConfig(c *models.AlertChannel) json.RawMessage {
	driver, ok := s.drivers.Get(c.Kind)
	if !ok {
		return json.RawMessage(`{}`)
	}
	return driver.RedactConfig(c.Config)
}

// Resolve returns a channel's driver and its destination, with the secret
// decrypted.
func (s *alertChannelService) Resolve(c *models.AlertChannel) (alertchannels.Driver, alertchannels.Destination, error) {
	driver, ok := s.drivers.Get(c.Kind)
	if !ok {
		return nil, alertchannels.Destination{}, fmt.Errorf("%w: alert channel kind %q is not supported", utils.ErrInvalidInput, c.Kind)
	}
	dest := alertchannels.Destination{Config: c.Config}
	if len(c.SecretEncrypted) > 0 {
		secret, err := utils.DecryptBytes(c.SecretEncrypted, s.encryptionKey)
		if err != nil {
			return nil, alertchannels.Destination{}, fmt.Errorf("failed to decrypt alert channel secret: %w", err)
		}
		dest.Secret = string(secret)
	}
	return driver, dest, nil
}

// RemoveForProject deletes every alert channel of a project (its own and its
// agents'). Errors are logged: the project is already gone.
func (s *alertChannelService) RemoveForProject(ctx context.Context, ouID, projectName string) {
	if err := s.repo.DeleteChannelsUnder(ctx, ouID, projectName, ""); err != nil {
		s.logger.Error("Failed to remove alert channels of a deleted project", "project", projectName, "error", err)
	}
}

// RemoveForAgent deletes an agent's alert channels. Errors are logged: the
// agent is already gone.
func (s *alertChannelService) RemoveForAgent(ctx context.Context, ouID, projectName, agentName string) {
	if err := s.repo.DeleteChannelsUnder(ctx, ouID, projectName, agentName); err != nil {
		s.logger.Error("Failed to remove alert channels of a deleted agent", "agent", agentName, "error", err)
	}
}

// validate checks and normalises an input for target's scope and returns the
// driver of its kind.
func (s *alertChannelService) validate(
	ctx context.Context, t repositories.AlertTarget, in *AlertChannelInput,
) (alertchannels.Driver, error) {
	in.Name = strings.TrimSpace(in.Name)
	in.Description = strings.TrimSpace(in.Description)
	if in.Name == "" || len(in.Name) > maxAlertChannelNameLength {
		return nil, fmt.Errorf("%w: name is required and must be at most %d characters", utils.ErrInvalidInput, maxAlertChannelNameLength)
	}
	if len(in.Description) > maxAlertChannelDescLength {
		return nil, fmt.Errorf("%w: description must be at most %d characters", utils.ErrInvalidInput, maxAlertChannelDescLength)
	}
	driver, ok := s.drivers.Get(in.Kind)
	if !ok {
		return nil, fmt.Errorf("%w: kind must be one of %s", utils.ErrInvalidInput, strings.Join(s.drivers.Kinds(), ", "))
	}
	cfg, err := driver.NormalizeConfig(ctx, in.Config)
	if err != nil {
		return nil, err
	}
	in.Config = cfg

	if t.Scope == models.AlertScopeAgent {
		envs := make([]string, 0, len(in.Environments))
		seenEnv := make(map[string]bool, len(in.Environments))
		for _, env := range in.Environments {
			env = strings.TrimSpace(env)
			if env != "" && !seenEnv[env] {
				seenEnv[env] = true
				envs = append(envs, env)
			}
		}
		if len(envs) == 0 {
			return nil, fmt.Errorf("%w: select at least one environment for an agent alert channel", utils.ErrInvalidInput)
		}
		in.Environments = envs
	} else {
		in.Environments = []string{}
	}

	seen := make(map[string]bool, len(in.EventTypes))
	types := make([]string, 0, len(in.EventTypes))
	for _, name := range in.EventTypes {
		def, ok := events.Lookup(name)
		if !ok || string(def.Scope) != t.Scope {
			return nil, fmt.Errorf("%w: %q is not a %s event", utils.ErrInvalidInput, name, t.Scope)
		}
		if !seen[name] {
			seen[name] = true
			types = append(types, name)
		}
	}
	in.EventTypes = types
	return driver, nil
}

// newSecret generates and encrypts a secret for a channel of driver's kind.
// It returns empty values for kinds without a secret.
func (s *alertChannelService) newSecret(driver alertchannels.Driver) (string, []byte, error) {
	secret, ok, err := driver.NewSecret()
	if err != nil || !ok {
		return "", nil, err
	}
	encrypted, err := utils.EncryptBytes([]byte(secret), s.encryptionKey)
	if err != nil {
		return "", nil, fmt.Errorf("failed to encrypt alert channel secret: %w", err)
	}
	return secret, encrypted, nil
}

func (s *alertChannelService) auditOpts(
	t repositories.AlertTarget, c *models.AlertChannel, driver alertchannels.Driver,
) []audit.Option {
	opts := []audit.Option{
		audit.Org(t.OUID),
		audit.Detail("scope", t.Scope),
		audit.Detail("kind", c.Kind),
		audit.Detail("eventCount", len(c.EventTypes)),
		audit.Detail("enabled", c.Enabled),
	}
	if driver != nil {
		// Scheme and host only: a destination path is often a credential.
		opts = append(opts, audit.Detail("destination", driver.Origin(c.Config)))
	}
	if c.ID != uuid.Nil {
		opts = append(opts, audit.ResourceNamed(audit.ResourceAlertChannel, c.ID.String(), c.Name))
	}
	if t.ProjectName != "" {
		opts = append(opts, audit.Project(t.ProjectName))
	}
	if len(c.Environments) > 0 {
		opts = append(opts, audit.Detail("environments", c.Environments))
	}
	return opts
}
