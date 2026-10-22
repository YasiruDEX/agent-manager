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

/** Which of a run's aggregated scores a threshold compares. */
export type ScoreThresholdAggregation = 'mean' | 'pass_rate';

export type ScoreThresholdOperator = 'below' | 'above';

/**
 * Notifies the watcher when a score of the monitor's runs crosses a value,
 * and again when it crosses back.
 */
export interface MonitorScoreThreshold {
  /** Display name of one of the monitor's evaluators. */
  evaluator: string;
  aggregation: ScoreThresholdAggregation;
  operator: ScoreThresholdOperator;
  /** Between 0 and 1. */
  value: number;
}

export interface MonitorWatchRequest {
  /** Notify when a run fails or cannot start. */
  notifyOnFailure: boolean;
  /** Notify when a run completes. */
  notifyOnSuccess: boolean;
  thresholds: MonitorScoreThreshold[];
}

export interface MonitorWatchResponse extends MonitorWatchRequest {
  /** Whether the caller watches the monitor. */
  watching: boolean;
  /** The thresholds the latest evaluated run breached. */
  breached?: MonitorScoreThreshold[];
  updatedAt?: string;
}

export interface MonitorWatchPathParams {
  orgName: string | undefined;
  projName: string | undefined;
  agentName: string | undefined;
  monitorName: string | undefined;
}

export type NotificationKind =
  | 'monitor_run_failed'
  | 'monitor_run_succeeded'
  | 'score_breached'
  | 'score_recovered';

/** The monitor, and run if any, a notification is about. */
export interface NotificationMonitorRef {
  projectName: string;
  agentName: string;
  environmentName?: string;
  monitorName: string;
  monitorDisplayName: string;
  runId?: string;
}

export interface NotificationResponse {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  monitor?: NotificationMonitorRef;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  /** Notifications matching the query, ignoring limit and offset. */
  total: number;
  unreadCount: number;
}

export interface NotificationListQuery {
  unread?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationUnreadCountResponse {
  count: number;
}
