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

import { httpDELETE, httpGET, httpPATCH, httpPOST, httpPUT, SERVICE_BASE } from "../utils";
import type {
  MonitorWatchPathParams,
  MonitorWatchRequest,
  MonitorWatchResponse,
  NotificationListQuery,
  NotificationListResponse,
  NotificationResponse,
  NotificationUnreadCountResponse,
} from "@agent-management-platform/types";

async function tokenOf(getToken?: () => Promise<string>) {
  return getToken ? await getToken() : undefined;
}

function notificationsBase(orgName: string | undefined): string {
  return `${SERVICE_BASE}/orgs/${encodeURIComponent(orgName ?? "default")}/notifications`;
}

function monitorWatchPath(params: MonitorWatchPathParams): string {
  const { orgName, projName, agentName, monitorName } = params;
  if (!projName || !agentName || !monitorName) {
    throw new Error("projName, agentName and monitorName are required");
  }
  return `${SERVICE_BASE}/orgs/${encodeURIComponent(orgName ?? "default")}` +
    `/projects/${encodeURIComponent(projName)}/agents/${encodeURIComponent(agentName)}` +
    `/monitors/${encodeURIComponent(monitorName)}/watch`;
}

export async function getMonitorWatch(
  params: MonitorWatchPathParams,
  getToken?: () => Promise<string>,
): Promise<MonitorWatchResponse> {
  const token = await tokenOf(getToken);
  const res = await httpGET(monitorWatchPath(params), { token });
  return res.json();
}

export async function putMonitorWatch(
  params: MonitorWatchPathParams,
  body: MonitorWatchRequest,
  getToken?: () => Promise<string>,
): Promise<MonitorWatchResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPUT(monitorWatchPath(params), body, { token });
  return res.json();
}

export async function deleteMonitorWatch(
  params: MonitorWatchPathParams,
  getToken?: () => Promise<string>,
): Promise<void> {
  const token = await tokenOf(getToken);
  await httpDELETE(monitorWatchPath(params), { token });
}

export async function listNotifications(
  orgName: string | undefined,
  query: NotificationListQuery,
  getToken?: () => Promise<string>,
): Promise<NotificationListResponse> {
  const token = await tokenOf(getToken);
  const searchParams: Record<string, string> = {};
  if (query.unread) searchParams.unread = "true";
  if (query.limit !== undefined) searchParams.limit = String(query.limit);
  if (query.offset !== undefined) searchParams.offset = String(query.offset);
  const res = await httpGET(notificationsBase(orgName), { searchParams, token });
  return res.json();
}

export async function getUnreadNotificationCount(
  orgName: string | undefined,
  getToken?: () => Promise<string>,
): Promise<NotificationUnreadCountResponse> {
  const token = await tokenOf(getToken);
  const res = await httpGET(`${notificationsBase(orgName)}/unread-count`, { token });
  return res.json();
}

export async function updateNotification(
  orgName: string | undefined,
  id: string,
  read: boolean,
  getToken?: () => Promise<string>,
): Promise<NotificationResponse> {
  const token = await tokenOf(getToken);
  const res = await httpPATCH(
    `${notificationsBase(orgName)}/${encodeURIComponent(id)}`,
    { read },
    { token },
  );
  return res.json();
}

export async function markAllNotificationsRead(
  orgName: string | undefined,
  getToken?: () => Promise<string>,
): Promise<void> {
  const token = await tokenOf(getToken);
  await httpPOST(`${notificationsBase(orgName)}/read-all`, {}, { token });
}
