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
	"github.com/wso2/agent-manager/agent-manager-service/models"
	"github.com/wso2/agent-manager/agent-manager-service/rbac"
)

func registerAlertingRoutes(rr *middleware.RouteRegistrar, controller controllers.AlertChannelController) {
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/alerting/event-types"), rbac.OrgView, controller.ListEventTypes)

	// Each scope is gated by the permissions of what it belongs to: org
	// channels are an admin setting, project and agent channels are part of
	// the project or agent. Written out per route so the authorization
	// invariant tests can read each permission.

	org := controller.ForScope(models.AlertScopeOrg)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/alerting/channels"), rbac.AlertingRead, org.List)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/alerting/channels"), rbac.AlertingManage, org.Create)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/alerting/channels/{channelId}"), rbac.AlertingRead, org.Get)
	rr.HandleFuncWithValidationAndAuthz(route("PUT", "/orgs/{orgName}/alerting/channels/{channelId}"), rbac.AlertingManage, org.Update)
	rr.HandleFuncWithValidationAndAuthz(route("DELETE", "/orgs/{orgName}/alerting/channels/{channelId}"), rbac.AlertingManage, org.Delete)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/alerting/channels/{channelId}/rotate-secret"), rbac.AlertingManage, org.RotateSecret)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/alerting/channels/{channelId}/test"), rbac.AlertingManage, org.Test)

	project := controller.ForScope(models.AlertScopeProject)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/projects/{projName}/alerting/channels"), rbac.ProjectRead, project.List)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/alerting/channels"), rbac.ProjectUpdate, project.Create)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/projects/{projName}/alerting/channels/{channelId}"), rbac.ProjectRead, project.Get)
	rr.HandleFuncWithValidationAndAuthz(route("PUT", "/orgs/{orgName}/projects/{projName}/alerting/channels/{channelId}"), rbac.ProjectUpdate, project.Update)
	rr.HandleFuncWithValidationAndAuthz(route("DELETE", "/orgs/{orgName}/projects/{projName}/alerting/channels/{channelId}"), rbac.ProjectUpdate, project.Delete)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/alerting/channels/{channelId}/rotate-secret"), rbac.ProjectUpdate, project.RotateSecret)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/alerting/channels/{channelId}/test"), rbac.ProjectUpdate, project.Test)

	agent := controller.ForScope(models.AlertScopeAgent)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels"), rbac.AgentRead, agent.List)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels"), rbac.AgentUpdate, agent.Create)
	rr.HandleFuncWithValidationAndAuthz(route("GET", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels/{channelId}"), rbac.AgentRead, agent.Get)
	rr.HandleFuncWithValidationAndAuthz(route("PUT", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels/{channelId}"), rbac.AgentUpdate, agent.Update)
	rr.HandleFuncWithValidationAndAuthz(route("DELETE", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels/{channelId}"), rbac.AgentUpdate, agent.Delete)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels/{channelId}/rotate-secret"), rbac.AgentUpdate, agent.RotateSecret)
	rr.HandleFuncWithValidationAndAuthz(route("POST", "/orgs/{orgName}/projects/{projName}/agents/{agentName}/alerting/channels/{channelId}/test"), rbac.AgentUpdate, agent.Test)
}
