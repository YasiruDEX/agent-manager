/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useParams } from "react-router-dom";
import { useTokenScopes } from "@agent-management-platform/api-client";
import { AlertChannelsSection } from "./alerting/AlertChannelsSection";

/**
 * Agent-level alerting. Each channel selects the environments it receives events of:
 * deployments, configuration, API keys, monitors and monitor runs there, plus
 * the agent's events that are not tied to an environment, such as builds.
 */
export const AgentAlerting: React.FC = () => {
  const { orgId, projectId, agentId, envId } = useParams<{
    orgId: string;
    projectId: string;
    agentId: string;
    envId: string;
  }>();
  const { enforced, scopes } = useTokenScopes();

  return (
    <AlertChannelsSection
      layout="page"
      title="Alerting"
      description={
        "Receive this agent's events, such as builds, deployments and monitor runs. " +
        "Each channel receives events of the environments you select for it."
      }
      target={{ scope: "agent", orgName: orgId, projName: projectId, agentName: agentId }}
      currentEnvironment={envId}
      addButtonPlacement="header"
      canManage={!enforced || scopes.has("amp:agent:update")}
    />
  );
};

export default AgentAlerting;
