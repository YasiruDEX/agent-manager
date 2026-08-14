// Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

func registerAgentRoutes(rr *middleware.RouteRegistrar, ctrl controllers.AgentController) {
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents", rbac.AgentCreate,
		growthanalytics.Track("amp.agent-development.create-agent", map[string]interface{}{
			"creation_method": "platform-hosted",
		}, ctrl.CreateAgent))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.create-agent", readActionDims("list"), ctrl.ListAgents))
	// Deliberately not tracked: a name suggestion, not an agent being created —
	// firing create-agent's adoption event here would count people who
	// generated a name and never created anything.
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/utils/generate-name", rbac.AgentCreate, ctrl.GenerateName)
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.create-agent", readActionDims("get"), ctrl.GetAgent))
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetDims("basic-info"), ctrl.UpdateAgentBasicInfo))
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/build-parameters", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetDims("build-parameters"), ctrl.UpdateAgentBuildParameters))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/resource-configs", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetReadDims("resource-configs"), ctrl.GetAgentResourceConfigs))
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/resource-configs", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetDims("resource-configs"), ctrl.UpdateAgentResourceConfigs))
	rr.HandleFuncWithValidationAndAuthz("DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}", rbac.AgentDelete,
		growthanalytics.Track("amp.agent-development.delete-agent", nil, ctrl.DeleteAgent))
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/builds", rbac.AgentBuild,
		growthanalytics.Track("amp.agent-development.build-agent", map[string]interface{}{
			"outcome": growthanalytics.DynamicOutcome,
		}, ctrl.BuildAgent))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/builds", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.build-agent", readActionDims("list"), ctrl.ListAgentBuilds))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/builds/{buildName}", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.build-agent", readActionDims("get"), ctrl.GetBuild))
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/deployments", rbac.AgentDeployNonProduction, ctrl.DeployAgent)
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/promote", rbac.AgentPromote, ctrl.PromoteAgent)
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/deploy-settings", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetDims("deploy-settings"), ctrl.UpdateAgentDeploySettings))
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/configurations", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetDims("configurations"), ctrl.UpdateAgentConfigurations))
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/tracing-token/regenerate", rbac.AgentTokenManage, ctrl.RegenerateTracingToken)
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/deployments", rbac.AgentRead, ctrl.GetAgentDeployments)
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/deployments/state", rbac.AgentSuspend, ctrl.UpdateDeploymentState)
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/endpoints", rbac.AgentRead, ctrl.GetAgentEndpoints)
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/configurations", rbac.AgentRead,
		growthanalytics.Track("amp.agent-development.update-agent", updateTargetReadDims("configurations"), ctrl.GetAgentConfigurations))
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/publish-kind", rbac.AgentKindCreate,
		growthanalytics.Track("amp.agent-development.publish-kind", nil, ctrl.PublishKind))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/identities", rbac.AgentUpdate, ctrl.GetAgentIdentity)
	rr.HandleFuncWithValidationAndAuthz("PUT /orgs/{orgName}/projects/{projName}/agents/{agentName}/identities", rbac.AgentUpdate, ctrl.ProvisionAgentIdentity)
	rr.HandleFuncWithValidationAndAuthz("POST /orgs/{orgName}/projects/{projName}/agents/{agentName}/identities", rbac.AgentUpdate, ctrl.RegenerateAgentIdentitySecret)
	rr.HandleFuncWithValidationAndAuthz("DELETE /orgs/{orgName}/projects/{projName}/agents/{agentName}/identities", rbac.AgentUpdate, ctrl.RevokeAgentIdentitySecret)
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/roles", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", map[string]interface{}{"action": "read", "view": "roles"}, ctrl.GetAgentRoles))
	rr.HandleFuncWithValidationAndAuthz("GET /orgs/{orgName}/projects/{projName}/agents/{agentName}/groups", rbac.AgentUpdate,
		growthanalytics.Track("amp.agent-development.update-agent", map[string]interface{}{"action": "read", "view": "groups"}, ctrl.GetAgentGroups))
}

// updateTargetDims builds the growth-analytics dimensions for the shared
// "amp.agent-development.update-agent" feature, tagging which part of the
// agent's configuration this specific route updates (the taxonomy's
// update_target dimension).
func updateTargetDims(target string) map[string]interface{} {
	return map[string]interface{}{"update_target": target}
}

// updateTargetReadDims is updateTargetDims for the GET counterpart of an
// update-agent route: same update_target, tagged as a read rather than a
// mutation so the two don't look identical in Moesif.
func updateTargetReadDims(target string) map[string]interface{} {
	return map[string]interface{}{"update_target": target, "action": "read"}
}

// readActionDims tags a list/get route on a feature whose primary tracked
// action is a mutation (create-agent, build-agent), so the read still
// reports under that feature's code without being mistaken for the
// mutation itself.
func readActionDims(action string) map[string]interface{} {
	return map[string]interface{}{"action": action}
}
