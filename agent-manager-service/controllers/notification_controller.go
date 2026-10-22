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

	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/jwtassertion"
	"github.com/wso2/agent-manager/agent-manager-service/middleware/logger"
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/services"
	"github.com/wso2/agent-manager/agent-manager-service/spec"
	"github.com/wso2/agent-manager/agent-manager-service/utils"
)

// PathParamNotificationID is the notification path parameter.
const PathParamNotificationID = "notificationId"

const (
	defaultNotificationLimit = 20
	maxNotificationLimit     = 100
)

// NotificationController serves the caller's monitor watches and console
// notifications. Every handler acts for the user the token was issued to.
type NotificationController interface {
	GetMonitorWatch(w http.ResponseWriter, r *http.Request)
	PutMonitorWatch(w http.ResponseWriter, r *http.Request)
	DeleteMonitorWatch(w http.ResponseWriter, r *http.Request)

	ListNotifications(w http.ResponseWriter, r *http.Request)
	GetUnreadCount(w http.ResponseWriter, r *http.Request)
	UpdateNotification(w http.ResponseWriter, r *http.Request)
	MarkAllRead(w http.ResponseWriter, r *http.Request)
}

type notificationController struct {
	svc services.NotificationService
}

// NewNotificationController creates a NotificationController.
func NewNotificationController(svc services.NotificationService) NotificationController {
	return &notificationController{svc: svc}
}

// callerUserID returns the token subject: the user whose watches and
// notifications a request acts on.
func callerUserID(w http.ResponseWriter, r *http.Request) (string, bool) {
	claims := jwtassertion.GetTokenClaims(r.Context())
	if claims == nil || claims.Sub == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "The request has no user")
		return "", false
	}
	return claims.Sub, true
}

func monitorRef(r *http.Request) services.MonitorRef {
	return services.MonitorRef{
		OUID:        middleware.OUIDFromRequest(r),
		ProjectName: r.PathValue(utils.PathParamProjName),
		AgentName:   r.PathValue(utils.PathParamAgentName),
		MonitorName: r.PathValue(utils.PathParamMonitorName),
	}
}

func (c *notificationController) GetMonitorWatch(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	watch, found, err := c.svc.GetWatch(r.Context(), monitorRef(r), userID)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to get monitor watch")
		return
	}
	if !found {
		// The defaults a new watch starts with.
		utils.WriteSuccessResponse(w, http.StatusOK, spec.MonitorWatchResponse{
			Watching:        false,
			NotifyOnFailure: true,
			Thresholds:      []spec.MonitorScoreThreshold{},
		})
		return
	}
	utils.WriteSuccessResponse(w, http.StatusOK, toMonitorWatchResponse(watch))
}

func (c *notificationController) PutMonitorWatch(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	var req spec.MonitorWatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	settings := services.MonitorWatchSettings{
		NotifyOnFailure: req.NotifyOnFailure,
		NotifyOnSuccess: req.NotifyOnSuccess,
		Thresholds:      make([]models.ScoreThreshold, 0, len(req.Thresholds)),
	}
	for _, t := range req.Thresholds {
		settings.Thresholds = append(settings.Thresholds, models.ScoreThreshold{
			Evaluator: t.Evaluator, Aggregation: t.Aggregation, Operator: t.Operator, Value: t.Value,
		})
	}
	watch, err := c.svc.SaveWatch(r.Context(), monitorRef(r), userID, settings)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to save monitor watch")
		return
	}
	utils.WriteSuccessResponse(w, http.StatusOK, toMonitorWatchResponse(watch))
}

func (c *notificationController) DeleteMonitorWatch(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	if err := c.svc.DeleteWatch(r.Context(), monitorRef(r), userID); err != nil {
		writeNotificationError(w, r, err, "Failed to delete monitor watch")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (c *notificationController) ListNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	q := r.URL.Query()
	limit, offset := defaultNotificationLimit, 0
	if raw := q.Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > maxNotificationLimit {
			utils.WriteErrorResponse(w, http.StatusBadRequest, "limit must be between 1 and 100")
			return
		}
		limit = parsed
	}
	if raw := q.Get("offset"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 0 {
			utils.WriteErrorResponse(w, http.StatusBadRequest, "offset must be zero or more")
			return
		}
		offset = parsed
	}
	unreadOnly := false
	if raw := q.Get("unread"); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusBadRequest, "unread must be true or false")
			return
		}
		unreadOnly = parsed
	}

	ouID := middleware.OUIDFromRequest(r)
	list, total, err := c.svc.List(r.Context(), ouID, userID, unreadOnly, limit, offset)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to list notifications")
		return
	}
	unread, err := c.svc.UnreadCount(r.Context(), ouID, userID)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to list notifications")
		return
	}
	resp := spec.NotificationListResponse{
		Notifications: make([]spec.NotificationResponse, 0, len(list)),
		Total:         int32(total),  //nolint:gosec // bounded by the retention window
		UnreadCount:   int32(unread), //nolint:gosec // bounded by the retention window
	}
	for i := range list {
		resp.Notifications = append(resp.Notifications, toNotificationResponse(&list[i]))
	}
	utils.WriteSuccessResponse(w, http.StatusOK, resp)
}

func (c *notificationController) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	n, err := c.svc.UnreadCount(r.Context(), middleware.OUIDFromRequest(r), userID)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to count unread notifications")
		return
	}
	utils.WriteSuccessResponse(w, http.StatusOK, spec.NotificationUnreadCountResponse{
		Count: int32(n), //nolint:gosec // bounded by the retention window
	})
}

func (c *notificationController) UpdateNotification(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	id, err := uuid.Parse(r.PathValue(PathParamNotificationID))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, "Notification not found")
		return
	}
	var req spec.NotificationUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	n, err := c.svc.SetRead(r.Context(), middleware.OUIDFromRequest(r), userID, id, req.Read)
	if err != nil {
		writeNotificationError(w, r, err, "Failed to update notification")
		return
	}
	utils.WriteSuccessResponse(w, http.StatusOK, toNotificationResponse(n))
}

func (c *notificationController) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := callerUserID(w, r)
	if !ok {
		return
	}
	if err := c.svc.MarkAllRead(r.Context(), middleware.OUIDFromRequest(r), userID); err != nil {
		writeNotificationError(w, r, err, "Failed to mark notifications read")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeNotificationError(w http.ResponseWriter, r *http.Request, err error, fallback string) {
	switch {
	case errors.Is(err, utils.ErrMonitorNotFound):
		utils.WriteErrorResponse(w, http.StatusNotFound, "Monitor not found")
	case errors.Is(err, utils.ErrNotificationNotFound):
		utils.WriteErrorResponse(w, http.StatusNotFound, "Notification not found")
	case errors.Is(err, utils.ErrInvalidInput):
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
	default:
		logger.GetLogger(r.Context()).Error(fallback, "error", err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, fallback)
	}
}

func toSpecThresholds(in []models.ScoreThreshold) []spec.MonitorScoreThreshold {
	out := make([]spec.MonitorScoreThreshold, 0, len(in))
	for _, t := range in {
		out = append(out, spec.MonitorScoreThreshold{
			Evaluator: t.Evaluator, Aggregation: t.Aggregation, Operator: t.Operator, Value: t.Value,
		})
	}
	return out
}

func toMonitorWatchResponse(watch *models.MonitorWatch) spec.MonitorWatchResponse {
	updated := watch.UpdatedAt
	return spec.MonitorWatchResponse{
		Watching:        true,
		NotifyOnFailure: watch.NotifyOnFailure,
		NotifyOnSuccess: watch.NotifyOnSuccess,
		Thresholds:      toSpecThresholds(watch.Thresholds),
		Breached:        toSpecThresholds(watch.BreachedThresholds()),
		UpdatedAt:       &updated,
	}
}

func toNotificationResponse(n *models.Notification) spec.NotificationResponse {
	resp := spec.NotificationResponse{
		Id:        n.ID.String(),
		Kind:      n.Kind,
		Title:     n.Title,
		Body:      n.Body,
		Read:      n.ReadAt != nil,
		CreatedAt: n.CreatedAt,
		ReadAt:    n.ReadAt,
	}
	if n.Target.MonitorName != "" {
		ref := spec.NotificationMonitorRef{
			ProjectName:        n.Target.ProjectName,
			AgentName:          n.Target.AgentName,
			MonitorName:        n.Target.MonitorName,
			MonitorDisplayName: n.Target.MonitorDisplayName,
		}
		if n.Target.EnvironmentName != "" {
			ref.EnvironmentName = &n.Target.EnvironmentName
		}
		if n.Target.RunID != "" {
			ref.RunId = &n.Target.RunID
		}
		resp.Monitor = &ref
	}
	return resp
}
