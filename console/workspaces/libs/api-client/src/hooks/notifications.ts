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

import { useQueryClient } from "@tanstack/react-query";
import {
  deleteMonitorWatch,
  getMonitorWatch,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  putMonitorWatch,
  updateNotification,
} from "../apis";
import type {
  MonitorWatchPathParams,
  MonitorWatchRequest,
  MonitorWatchResponse,
  NotificationListQuery,
  NotificationListResponse,
  NotificationResponse,
  NotificationUnreadCountResponse,
} from "@agent-management-platform/types";
import { useAuthHooks } from "@agent-management-platform/auth";
import { useApiMutation, useApiQuery } from "./react-query-notifications";
import { useRuntimeConfig } from "./runtime-config";

/** How often the bell checks for new notifications. */
const NOTIFICATION_POLL_MS = 30_000;

/** Whether the deployment notifies users about watched monitors. */
export function useNotificationsEnabled(): boolean {
  const { data } = useRuntimeConfig();
  return data?.notificationsEnabled === true;
}

function watchReady(p: MonitorWatchPathParams): boolean {
  return !!(p.orgName && p.projName && p.agentName && p.monitorName);
}

/** Hook to get the caller's watch on a monitor. */
export function useMonitorWatch(params: MonitorWatchPathParams, enabled = true) {
  const { getToken } = useAuthHooks();
  return useApiQuery<MonitorWatchResponse>({
    queryKey: ["monitor-watch", params],
    queryFn: () => getMonitorWatch(params, getToken),
    enabled: enabled && watchReady(params),
  });
}

/** Hook to watch a monitor, or change the caller's watch settings. */
export function useSaveMonitorWatch(params: MonitorWatchPathParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<MonitorWatchResponse, unknown, MonitorWatchRequest>({
    successMessage: "Watch settings saved",
    mutationFn: (body) => putMonitorWatch(params, body, getToken),
    onSuccess: (data) => queryClient.setQueryData(["monitor-watch", params], data),
  });
}

/** Hook to stop watching a monitor. */
export function useDeleteMonitorWatch(params: MonitorWatchPathParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<void, unknown, void>({
    successMessage: "Stopped watching the monitor",
    mutationFn: () => deleteMonitorWatch(params, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monitor-watch", params] }),
  });
}

/** Hook to list the caller's notifications. Polls while poll is true. */
export function useListNotifications(
  orgName: string | undefined,
  query: NotificationListQuery,
  options: { enabled?: boolean; poll?: boolean } = {},
) {
  const { getToken } = useAuthHooks();
  const { enabled = true, poll = false } = options;
  return useApiQuery<NotificationListResponse>({
    queryKey: ["notifications", orgName, "list", query],
    queryFn: () => listNotifications(orgName, query, getToken),
    enabled: enabled && !!orgName,
    refetchInterval: poll ? NOTIFICATION_POLL_MS : false,
  });
}

/** Hook to count the caller's unread notifications, polled for the bell. */
export function useUnreadNotificationCount(orgName: string | undefined, enabled = true) {
  const { getToken } = useAuthHooks();
  return useApiQuery<NotificationUnreadCountResponse>({
    queryKey: ["notifications", orgName, "unread-count"],
    queryFn: () => getUnreadNotificationCount(orgName, getToken),
    enabled: enabled && !!orgName,
    refetchInterval: NOTIFICATION_POLL_MS,
    // The bell only decorates the header; a failed poll is not worth a toast.
    silent: true,
  });
}

/** Hook to mark one notification read or unread. */
export function useSetNotificationRead(orgName: string | undefined) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<NotificationResponse, unknown, { id: string; read: boolean }>({
    mutationFn: ({ id, read }) => updateNotification(orgName, id, read, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", orgName] }),
  });
}

/** Hook to mark all of the caller's notifications read. */
export function useMarkAllNotificationsRead(orgName: string | undefined) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<void, unknown, void>({
    mutationFn: () => markAllNotificationsRead(orgName, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", orgName] }),
  });
}

/**
 * Hook to set the caller's watch on a monitor named at call time: watch it
 * with the given settings, or stop watching when they are null. For forms
 * that save a monitor and its watch together.
 */
export function useApplyMonitorWatch(base: Omit<MonitorWatchPathParams, "monitorName">) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<void, unknown, { monitorName: string; watch: MonitorWatchRequest | null }>({
    errorMessage: "The monitor was saved, but your watch settings were not",
    mutationFn: async ({ monitorName, watch }) => {
      const params = { ...base, monitorName };
      if (watch) {
        await putMonitorWatch(params, watch, getToken);
      } else {
        await deleteMonitorWatch(params, getToken);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monitor-watch"] }),
  });
}
