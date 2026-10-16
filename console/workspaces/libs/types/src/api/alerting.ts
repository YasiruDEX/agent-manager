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

export type AlertScope = 'org' | 'project' | 'agent';

/**
 * How an alert channel delivers events: "webhook" posts the signed CloudEvent;
 * "notify" sends a text notification to a chat, email, paging or push service.
 */
export type AlertChannelKind = 'webhook' | 'notify';

/** Settings of a "webhook" channel. */
export interface WebhookChannelConfig {
  /** HTTPS URL that receives signed event POST requests. */
  url: string;
}

/** Settings of a "notify" channel. */
export interface NotifyChannelConfig {
  /** A service id from the channel-kinds list, e.g. "slack". */
  service: string;
  /**
   * The Shoutrrr service URL. Sent to set or replace it; never returned.
   * Leave it out on update to keep the current one.
   */
  url?: string;
}

/** Settings of a channel, by kind. */
export type AlertChannelConfig = Partial<WebhookChannelConfig> & Partial<NotifyChannelConfig>;

/** A service a channel kind delivers to, such as Slack for "notify". */
export interface AlertChannelKindService {
  id: string;
  label: string;
  category: string;
  /** The shape of the service URL. */
  urlFormat: string;
  /** How to get the values the URL needs. */
  docsUrl: string;
}

export interface AlertChannelKindInfo {
  kind: AlertChannelKind;
  /** Channels get a generated secret that can be rotated. */
  generatedSecret: boolean;
  /** Channels take a credential the user enters, which is never returned. */
  suppliedCredential: boolean;
  services: AlertChannelKindService[];
}

export interface AlertChannelKindListResponse {
  kinds: AlertChannelKindInfo[];
}

export interface AlertEventType {
  type: string;
  scope: AlertScope;
  category: string;
  description: string;
}

export interface AlertEventTypeListResponse {
  eventTypes: AlertEventType[];
}

export interface AlertChannelRequest {
  name: string;
  description?: string;
  kind: AlertChannelKind;
  config: AlertChannelConfig;
  /**
   * Environments an agent channel receives events of; at least one is
   * required for agent channels. Agent events not tied to an environment,
   * such as builds, go to every agent channel.
   */
  environments?: string[];
  eventTypes: string[];
  enabled?: boolean;
}

export interface AlertChannelResponse {
  id: string;
  scope: AlertScope;
  kind: AlertChannelKind;
  name: string;
  description: string;
  /** Masked for callers who can view the channel but not change it. */
  config: AlertChannelConfig;
  environments: string[];
  eventTypes: string[];
  enabled: boolean;
  /**
   * Present only in the response that created the channel, for kinds with a
   * generated secret (a webhook's signing secret).
   */
  secret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertChannelListResponse {
  channels: AlertChannelResponse[];
}

export interface AlertChannelSecretResponse {
  secret: string;
}

export interface AlertChannelTestResponse {
  delivered: boolean;
  statusCode?: number;
  error?: string;
}

export type AlertDeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface AlertDeliveryResponse {
  id: string;
  eventId: string;
  eventType: string;
  status: AlertDeliveryStatus;
  attempts: number;
  responseCode?: number;
  lastError?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertDeliveryListResponse {
  deliveries: AlertDeliveryResponse[];
}

/**
 * Identifies the owner of a set of alert channels: the org, a project in it,
 * or an agent in a project.
 */
export interface AlertTargetParams {
  scope: AlertScope;
  orgName?: string;
  projName?: string;
  agentName?: string;
}
