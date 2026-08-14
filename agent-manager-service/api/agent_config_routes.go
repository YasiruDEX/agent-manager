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
	"github.com/wso2/agent-manager/agent-manager-service/middleware/growthanalytics"
	"github.com/wso2/agent-manager/agent-manager-service/rbac"
)

// RegisterAgentConfigRoutes registers all agent configuration routes
func RegisterAgentConfigRoutes(rr *middleware.RouteRegistrar, ctrl controllers.AgentConfigurationController) {
	rr.HandleFuncWithValidationAndAuthz(
		"POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs",
		rbac.AgentUpdate, growthanalytics.Track("amp.agent-development.bind-model-config", bindActionDims("create"), ctrl.CreateAgentModelConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs",
		rbac.AgentRead, growthanalytics.Track("amp.agent-development.bind-model-config", bindActionDims("list"), ctrl.ListAgentModelConfigs),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}",
		rbac.AgentRead, growthanalytics.Track("amp.agent-development.bind-model-config", bindActionDims("get"), ctrl.GetAgentModelConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}",
		rbac.AgentUpdate, growthanalytics.Track("amp.agent-development.bind-model-config", bindActionDims("update"), ctrl.UpdateAgentModelConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}",
		rbac.AgentDelete, growthanalytics.Track("amp.agent-development.bind-model-config", bindActionDims("delete"), ctrl.DeleteAgentModelConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs",
		rbac.AgentUpdate, growthanalytics.Track("amp.agent-development.bind-mcp-config", bindActionDims("create"), ctrl.CreateAgentMCPConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs",
		rbac.AgentRead, growthanalytics.Track("amp.agent-development.bind-mcp-config", bindActionDims("list"), ctrl.ListAgentMCPConfigs),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}",
		rbac.AgentRead, growthanalytics.Track("amp.agent-development.bind-mcp-config", bindActionDims("get"), ctrl.GetAgentMCPConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}",
		rbac.AgentUpdate, growthanalytics.Track("amp.agent-development.bind-mcp-config", bindActionDims("update"), ctrl.UpdateAgentMCPConfig),
	)

	rr.HandleFuncWithValidationAndAuthz(
		"DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}",
		rbac.AgentDelete, growthanalytics.Track("amp.agent-development.bind-mcp-config", bindActionDims("delete"), ctrl.DeleteAgentMCPConfig),
	)

	// Per-config MCP API keys (external agents): the key an agent uses to call its
	// MCP server through the gateway, scoped to a configuration + environment.
	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}/environments/{envName}/api-keys",
		rbac.AgentRead, ctrl.ListMCPConfigAPIKeys,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}/environments/{envName}/api-keys",
		rbac.AgentAPIKeyManage, ctrl.CreateMCPConfigAPIKey,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}/environments/{envName}/api-keys/{keyName}",
		rbac.AgentAPIKeyManage, ctrl.RotateMCPConfigAPIKey,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}/mcp-configs/{configId}/environments/{envName}/api-keys/{keyName}",
		rbac.AgentAPIKeyManage, ctrl.RevokeMCPConfigAPIKey,
	)

	// Per-config LLM API keys (external agents): the key an agent uses to call its
	// LLM provider through the gateway, scoped to a configuration + environment.
	rr.HandleFuncWithValidationAndAuthz(
		"GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}/environments/{envName}/api-keys",
		rbac.AgentRead, ctrl.ListLLMConfigAPIKeys,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}/environments/{envName}/api-keys",
		rbac.AgentAPIKeyManage, ctrl.CreateLLMConfigAPIKey,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}/environments/{envName}/api-keys/{keyName}",
		rbac.AgentAPIKeyManage, ctrl.RotateLLMConfigAPIKey,
	)

	rr.HandleFuncWithValidationAndAuthz(
		"DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}/model-configs/{configId}/environments/{envName}/api-keys/{keyName}",
		rbac.AgentAPIKeyManage, ctrl.RevokeLLMConfigAPIKey,
	)
}

// bindActionDims builds the growth-analytics dimensions shared by
// "amp.agent-development.bind-model-config" and "bind-mcp-config", tagging
// which CRUD action this specific route performs on the binding.
func bindActionDims(action string) map[string]interface{} {
	return map[string]interface{}{"action": action}
}
