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

import { httpDELETE, httpGET, httpPOST, httpPUT, SERVICE_BASE } from "../utils";
import type {
  AlertDeliveryListResponse,
  AlertEventTypeListResponse,
  AlertChannelListResponse,
  AlertChannelRequest,
  AlertChannelResponse,
  AlertScope,
  AlertChannelSecretResponse,
  AlertTargetParams,
  AlertChannelTestResponse,
} from "@agent-management-platform/types";

/** Base path of a scope's alert channels. */
export function alertChannelsBase(target: AlertTargetParams): string {
  const org = `${SERVICE_BASE}/orgs/${encodeURIComponent(target.orgName ?? "default")}`;
  if (target.scope === "org") return `${org}/alerting/channels`;
  if (!target.projName) throw new Error("projName is required");
  const project = `${org}/projects/${encodeURIComponent(target.projName)}`;
  if (target.scope === "project") return `${project}/alerting/channels`;
  if (!target.agentName) throw new Error("agentName is required");
  return `${project}/agents/${encodeURIComponent(target.agentName)}/alerting/channels`;
}

async function tokenOf(getToken?: () => Promise<string>) {
  return getToken ? await getToken() : undefined;
}

export async function listAlertEventTypes(
  orgName: string | undefined,
  scope: AlertScope,
  getToken?: () => Promise<string>,
): Promise<AlertEventTypeListResponse> {
  const token = await tokenOf(getToken);
  const res = await httpGET(
    `${SERVICE_BASE}/orgs/${encodeURIComponent(orgName ?? "default")}/alerting/event-types`,
    { searchParams: { scope }, token },
  );
  return res.json();
}

export async function listAlertChannels(
  target: AlertTargetParams,
  getToken?: () => Promise<string>,
): Promise<AlertChannelListResponse> {
  const token = await tokenOf(getToken);
  const res = await httpGET(alertChannelsBase(target), { token });
  return res.json();
}

export async function createAlertChannel(
  target: AlertTargetParams,
  body: AlertChannelRequest,
  getToken?: () => Promise<string>,
): Promise<AlertChannelResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPOST(alertChannelsBase(target), body, { token });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateAlertChannel(
  target: AlertTargetParams,
  id: string,
  body: AlertChannelRequest,
  getToken?: () => Promise<string>,
): Promise<AlertChannelResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPUT(`${alertChannelsBase(target)}/${encodeURIComponent(id)}`, body, { token });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteAlertChannel(
  target: AlertTargetParams,
  id: string,
  getToken?: () => Promise<string>,
): Promise<void> {
  const token = await tokenOf(getToken);
  const res = await httpDELETE(`${alertChannelsBase(target)}/${encodeURIComponent(id)}`, { token });
  if (!res.ok) throw await res.json();
}

export async function rotateAlertChannelSecret(
  target: AlertTargetParams,
  id: string,
  getToken?: () => Promise<string>,
): Promise<AlertChannelSecretResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPOST(`${alertChannelsBase(target)}/${encodeURIComponent(id)}/rotate-secret`, {}, { token });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function testAlertChannel(
  target: AlertTargetParams,
  id: string,
  getToken?: () => Promise<string>,
): Promise<AlertChannelTestResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPOST(`${alertChannelsBase(target)}/${encodeURIComponent(id)}/test`, {}, { token });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function listAlertChannelDeliveries(
  target: AlertTargetParams,
  id: string,
  limit?: number,
  getToken?: () => Promise<string>,
): Promise<AlertDeliveryListResponse> {
  const token = await tokenOf(getToken);
  const res = await httpGET(`${alertChannelsBase(target)}/${encodeURIComponent(id)}/deliveries`, {
    searchParams: limit ? { limit: String(limit) } : undefined,
    token,
  });
  return res.json();
}
