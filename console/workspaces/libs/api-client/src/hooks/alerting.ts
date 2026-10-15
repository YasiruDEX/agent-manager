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
  createAlertChannel,
  deleteAlertChannel,
  listAlertChannelDeliveries,
  listAlertEventTypes,
  listAlertChannels,
  rotateAlertChannelSecret,
  testAlertChannel,
  updateAlertChannel,
} from "../apis";
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
import { useAuthHooks } from "@agent-management-platform/auth";
import { useApiMutation, useApiQuery } from "./react-query-notifications";
import { useRuntimeConfig } from "./runtime-config";

/** Whether a target names everything its scope needs. */
function targetReady(t: AlertTargetParams): boolean {
  if (!t.orgName) return false;
  if (t.scope === "org") return true;
  if (!t.projName) return false;
  return t.scope === "project" || !!t.agentName;
}

/** Hook to list the event types a scope's alert channels can subscribe to. */
export function useAlertEventTypes(orgName: string | undefined, scope: AlertScope) {
  const { getToken } = useAuthHooks();
  return useApiQuery<AlertEventTypeListResponse>({
    queryKey: ["alert-event-types", orgName, scope],
    queryFn: () => listAlertEventTypes(orgName, scope, getToken),
    enabled: !!orgName,
    staleTime: Infinity,
  });
}

/** Hook to list a scope's alert channels. Pass enabled=false to skip the request. */
export function useListAlertChannels(target: AlertTargetParams, enabled = true) {
  const { getToken } = useAuthHooks();
  return useApiQuery<AlertChannelListResponse>({
    queryKey: ["alert-channels", target],
    queryFn: () => listAlertChannels(target, getToken),
    enabled: enabled && targetReady(target),
  });
}

/** Hook to create an alert channel. The response carries its generated secret once. */
export function useCreateAlertChannel(target: AlertTargetParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<AlertChannelResponse, unknown, AlertChannelRequest>({
    action: { verb: "create", target: "alert channel" },
    mutationFn: (body) => createAlertChannel(target, body, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-channels", target] }),
  });
}

/** Hook to update an alert channel. */
export function useUpdateAlertChannel(target: AlertTargetParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<AlertChannelResponse, unknown, { id: string; body: AlertChannelRequest }>({
    action: { verb: "update", target: "alert channel" },
    mutationFn: ({ id, body }) => updateAlertChannel(target, id, body, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-channels", target] }),
  });
}

/** Hook to delete an alert channel. */
export function useDeleteAlertChannel(target: AlertTargetParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<void, unknown, string>({
    action: { verb: "delete", target: "alert channel" },
    mutationFn: (id) => deleteAlertChannel(target, id, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-channels", target] }),
  });
}

/** Hook to rotate an alert channel's generated secret. */
export function useRotateAlertChannelSecret(target: AlertTargetParams) {
  const { getToken } = useAuthHooks();
  return useApiMutation<AlertChannelSecretResponse, unknown, string>({
    action: { verb: "update", target: "alert channel secret" },
    mutationFn: (id) => rotateAlertChannelSecret(target, id, getToken),
  });
}

/**
 * Hook to send a test event. A request that reached the service succeeds even
 * when the endpoint refused the event, so callers show the outcome from the
 * result instead of a success snackbar.
 */
export function useTestAlertChannel(target: AlertTargetParams) {
  const { getToken } = useAuthHooks();
  const queryClient = useQueryClient();
  return useApiMutation<AlertChannelTestResponse, unknown, string>({
    mutationFn: (id) => testAlertChannel(target, id, getToken),
    showSuccess: false,
    onSuccess: (_d, id) => queryClient.invalidateQueries({ queryKey: ["alert-deliveries", target, id] }),
  });
}

/** Hook to list an alert channel's recent deliveries. */
export function useAlertChannelDeliveries(target: AlertTargetParams, id: string | undefined) {
  const { getToken } = useAuthHooks();
  return useApiQuery<AlertDeliveryListResponse>({
    queryKey: ["alert-deliveries", target, id],
    queryFn: () => listAlertChannelDeliveries(target, id ?? "", 50, getToken),
    enabled: !!id && targetReady(target),
  });
}

/**
 * Whether the deployment runs alerting (an event bus). The service decides,
 * through GET /api/v1/config; the console has no flag of its own.
 */
export function useAlertingEnabled(): boolean {
  const { data } = useRuntimeConfig();
  return data?.alertingEnabled === true;
}
