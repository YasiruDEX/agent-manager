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

package api

import (
	"github.com/wso2/agent-manager/agent-manager-service/controllers"
	"github.com/wso2/agent-manager/agent-manager-service/middleware"
	"github.com/wso2/agent-manager/agent-manager-service/rbac"
)

func registerNotificationRoutes(rr *middleware.RouteRegistrar, controller controllers.NotificationController) {
	// Watching acts only on the caller's own watch, so anyone who can see the
	// monitor may watch it.
	watch := "/orgs/{orgName}/projects/{projName}/agents/{agentName}/monitors/{monitorName}/watch"
	rr.HandleFuncWithValidationAndAuthz(route("GET", watch), rbac.MonitorRead, controller.GetMonitorWatch)
	rr.HandleFuncWithValidationAndAuthz(route("PUT", watch), rbac.MonitorRead, controller.PutMonitorWatch)
	rr.HandleFuncWithValidationAndAuthz(route("DELETE", watch), rbac.MonitorRead, controller.DeleteMonitorWatch)

	// Every member of the org has an inbox; each sees only their own.
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/notifications"), rbac.OrgView, controller.ListNotifications)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/notifications/unread-count"), rbac.OrgView, controller.GetUnreadCount)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/notifications/read-all"), rbac.OrgView, controller.MarkAllRead)
	rr.HandleFuncWithValidationAndAuthz(route("PATCH", "/orgs/{orgName}/notifications/{notificationId}"), rbac.OrgView, controller.UpdateNotification)
}
