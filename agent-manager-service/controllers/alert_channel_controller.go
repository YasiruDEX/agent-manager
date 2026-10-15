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

package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/google/uuid"

	"github.com/wso2/agent-manager/agent-manager-service/audit"
	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/logger"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/rbac"
	"github.com/wso2/agent-manager/agent-manager-service/repositories"
	"github.com/wso2/agent-manager/agent-manager-service/services"
	"github.com/wso2/agent-manager/agent-manager-service/spec"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

// PathParamAlertChannelID is the alert channel path parameter.
const PathParamAlertChannelID = "channelId"

// AlertChannelController serves alert channels at org, project and agent
// scope. The scope is fixed per route: each handler is bound to one through
// ForScope.
type AlertChannelController interface {
	ListEventTypes(w http.ResponseWriter, r *http.Request)
	ForScope(scope string) AlertChannelScopeHandlers
}

// AlertChannelScopeHandlers are the handlers for one scope.
type AlertChannelScopeHandlers struct {
	List           http.HandlerFunc
	Create         http.HandlerFunc
	Get            http.HandlerFunc
	Update         http.HandlerFunc
	Delete         http.HandlerFunc
	RotateSecret   http.HandlerFunc
	Test           http.HandlerFunc
	ListDeliveries http.HandlerFunc
}

type alertChannelController struct {
	svc services.AlertChannelService
}

// NewAlertChannelController creates an AlertChannelController.
func NewAlertChannelController(svc services.AlertChannelService) AlertChannelController {
	return &alertChannelController{svc: svc}
}

func (c *alertChannelController) ListEventTypes(w http.ResponseWriter, r *http.Request) {
	types, err := c.svc.EventTypes(r.URL.Query().Get("scope"))
	if err != nil {
		writeAlertChannelError(w, r, err, "Failed to list event types")
		return
	}
	resp := spec.AlertEventTypeListResponse{EventTypes: make([]spec.AlertEventType, 0, len(types))}
	for _, t := range types {
		resp.EventTypes = append(resp.EventTypes, spec.AlertEventType{
			Type: t.Name, Scope: string(t.Scope), Category: t.Category, Description: t.Description,
		})
	}
	utils.WriteSuccessResponse(w, http.StatusOK, resp)
}

// alertChannelManagePermission is the permission that may change a scope's
// channels, and so see their full settings.
var alertChannelManagePermission = map[string]rbac.Permission{
	models.AlertScopeOrg:     rbac.AlertingManage,
	models.AlertScopeProject: rbac.ProjectUpdate,
	models.AlertScopeAgent:   rbac.AgentUpdate,
}

func (c *alertChannelController) ForScope(scope string) AlertChannelScopeHandlers {
	// A channel's settings may carry a credential (a webhook URL path, say),
	// so callers who can only read a scope's channels see them masked.
	canSeeConfig := func(r *http.Request) bool {
		return jwtassertion.HoldsAnyScope(r.Context(), alertChannelManagePermission[scope])
	}
	target := func(r *http.Request) repositories.AlertTarget {
		t := repositories.AlertTarget{OUID: middleware.OUIDFromRequest(r), Scope: scope}
		if scope != models.AlertScopeOrg {
			t.ProjectName = r.PathValue(utils.PathParamProjName)
		}
		if scope == models.AlertScopeAgent {
			t.AgentName = r.PathValue(utils.PathParamAgentName)
		}
		return t
	}
	withID := func(fn func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID)) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			id, err := uuid.Parse(r.PathValue(PathParamAlertChannelID))
			if err != nil {
				utils.WriteErrorResponse(w, http.StatusNotFound, "Alert channel not found")
				return
			}
			fn(w, r, target(r), id)
		}
	}

	return AlertChannelScopeHandlers{
		List: func(w http.ResponseWriter, r *http.Request) {
			list, err := c.svc.List(r.Context(), target(r))
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to list alert channels")
				return
			}
			resp := spec.AlertChannelListResponse{Channels: make([]spec.AlertChannelResponse, 0, len(list))}
			full := canSeeConfig(r)
			for i := range list {
				resp.Channels = append(resp.Channels, c.toResponse(&list[i], "", full))
			}
			utils.WriteSuccessResponse(w, http.StatusOK, resp)
		},
		Create: func(w http.ResponseWriter, r *http.Request) {
			in, ok := decodeAlertChannelRequest(w, r)
			if !ok {
				return
			}
			ch, secret, err := c.svc.Create(r.Context(), target(r), in)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to create alert channel")
				return
			}
			utils.WriteSuccessResponse(w, http.StatusCreated, c.toResponse(ch, secret, true))
		},
		Get: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			ch, err := c.svc.Get(r.Context(), t, id)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to get alert channel")
				return
			}
			utils.WriteSuccessResponse(w, http.StatusOK, c.toResponse(ch, "", canSeeConfig(r)))
		}),
		Update: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			in, ok := decodeAlertChannelRequest(w, r)
			if !ok {
				return
			}
			ch, err := c.svc.Update(r.Context(), t, id, in)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to update alert channel")
				return
			}
			utils.WriteSuccessResponse(w, http.StatusOK, c.toResponse(ch, "", true))
		}),
		Delete: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			if err := c.svc.Delete(r.Context(), t, id); err != nil {
				writeAlertChannelError(w, r, err, "Failed to delete alert channel")
				return
			}
			w.WriteHeader(http.StatusNoContent)
		}),
		RotateSecret: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			secret, err := c.svc.RotateSecret(r.Context(), t, id)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to rotate alert channel secret")
				return
			}
			utils.WriteSuccessResponse(w, http.StatusOK, spec.AlertChannelSecretResponse{Secret: secret})
		}),
		Test: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			result, err := c.svc.Test(r.Context(), t, id)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to send test event")
				return
			}
			resp := spec.AlertChannelTestResponse{Delivered: result.Delivered}
			if result.StatusCode != 0 {
				code := int32(result.StatusCode)
				resp.StatusCode = &code
			}
			if result.Error != "" {
				resp.Error = &result.Error
			}
			utils.WriteSuccessResponse(w, http.StatusOK, resp)
		}),
		ListDeliveries: withID(func(w http.ResponseWriter, r *http.Request, t repositories.AlertTarget, id uuid.UUID) {
			limit := 0
			if raw := r.URL.Query().Get("limit"); raw != "" {
				parsed, err := strconv.Atoi(raw)
				if err != nil || parsed < 1 {
					utils.WriteErrorResponse(w, http.StatusBadRequest, "limit must be a positive integer")
					return
				}
				limit = parsed
			}
			list, err := c.svc.ListDeliveries(r.Context(), t, id, limit)
			if err != nil {
				writeAlertChannelError(w, r, err, "Failed to list alert deliveries")
				return
			}
			resp := spec.AlertDeliveryListResponse{Deliveries: make([]spec.AlertDeliveryResponse, 0, len(list))}
			for i := range list {
				resp.Deliveries = append(resp.Deliveries, toAlertDeliveryResponse(&list[i]))
			}
			utils.WriteSuccessResponse(w, http.StatusOK, resp)
		}),
	}
}

func decodeAlertChannelRequest(w http.ResponseWriter, r *http.Request) (services.AlertChannelInput, bool) {
	var req spec.AlertChannelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return services.AlertChannelInput{}, false
	}
	cfg, err := json.Marshal(req.Config)
	if err != nil || req.Config == nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "config must be an object")
		return services.AlertChannelInput{}, false
	}
	in := services.AlertChannelInput{
		Name:         req.Name,
		Kind:         req.Kind,
		Config:       cfg,
		Environments: req.Environments,
		EventTypes:   req.EventTypes,
		Enabled:      req.Enabled == nil || *req.Enabled,
	}
	if req.Description != nil {
		in.Description = *req.Description
	}
	if in.EventTypes == nil {
		in.EventTypes = []string{}
	}
	return in, true
}

func writeAlertChannelError(w http.ResponseWriter, r *http.Request, err error, fallback string) {
	switch {
	case errors.Is(err, utils.ErrAlertChannelNotFound):
		utils.WriteErrorResponse(w, http.StatusNotFound, "Alert channel not found")
	case errors.Is(err, utils.ErrInvalidInput):
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, audit.ErrRecorderUnavailable):
		logger.GetLogger(r.Context()).Error(fallback, "error", err)
		utils.WriteErrorResponse(w, http.StatusServiceUnavailable, "Audit trail unavailable; the change was not applied")
	default:
		logger.GetLogger(r.Context()).Error(fallback, "error", err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, fallback)
	}
}

func (c *alertChannelController) toResponse(ch *models.AlertChannel, secret string, fullConfig bool) spec.AlertChannelResponse {
	raw := ch.Config
	if !fullConfig {
		raw = c.svc.RedactedConfig(ch)
	}
	cfg := map[string]interface{}{}
	_ = json.Unmarshal(raw, &cfg)
	resp := spec.AlertChannelResponse{
		Id:           ch.ID.String(),
		Scope:        ch.Scope,
		Kind:         ch.Kind,
		Name:         ch.Name,
		Description:  ch.Description,
		Config:       cfg,
		Environments: ch.Environments,
		EventTypes:   ch.EventTypes,
		Enabled:      ch.Enabled,
		CreatedAt:    ch.CreatedAt,
		UpdatedAt:    ch.UpdatedAt,
	}
	if resp.Environments == nil {
		resp.Environments = []string{}
	}
	if resp.EventTypes == nil {
		resp.EventTypes = []string{}
	}
	if secret != "" {
		resp.Secret = &secret
	}
	return resp
}

func toAlertDeliveryResponse(d *models.AlertDelivery) spec.AlertDeliveryResponse {
	resp := spec.AlertDeliveryResponse{
		Id:          d.ID.String(),
		EventId:     d.EventID,
		EventType:   d.EventType,
		Status:      d.Status,
		Attempts:    int32(d.Attempts),
		DeliveredAt: d.DeliveredAt,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
	if d.ResponseCode != nil {
		code := int32(*d.ResponseCode)
		resp.ResponseCode = &code
	}
	if d.LastError != "" {
		msg := d.LastError
		resp.LastError = &msg
	}
	return resp
}
