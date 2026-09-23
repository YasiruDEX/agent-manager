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

/**
 * Console usage analytics: the buffer behind `useTrack`.
 *
 * Reporting is deliberately *not* a TanStack mutation. `useApiMutation` exists
 * to turn a user's action into a snackbar and a cache invalidation, and
 * telemetry must do neither — a failed flush is invisible to the user by
 * design, and it touches no server state the console reads back. It also must
 * not fire a request per interaction: page views alone would put one request
 * per navigation on the API. So actions are buffered and flushed in batches.
 *
 * Every failure path here ends in "drop the buffer and carry on". Telemetry
 * that can break the console, block a navigation, or retry into a struggling
 * backend is worse than no telemetry.
 */

import { globalConfig } from "@agent-management-platform/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  reportConsoleActions,
  reportConsoleActionsOnUnload,
  type ConsoleActionDimensionValue,
  type ConsoleActionPayload,
} from "../apis/telemetry";

/**
 * Console action taxonomy. These names must match the server-side allowlist in
 * `middleware/growthanalytics/console.go` — an action missing there is
 * accepted and dropped, never forwarded to Moesif.
 *
 * Deliberately disjoint from the endpoint feature codes the service reports
 * from its routes: an action belongs here precisely because no API call
 * observes it (a page view, an abandoned form, a cancelled confirmation, a
 * copied snippet). Nothing here duplicates a mutation the backend already
 * tracks; together they give the funnel those mutations are the end of.
 */
export const ConsoleAction = {
  // Navigation and discovery
  PageView: "amp.console.navigation.page-view",
  TabSwitch: "amp.console.navigation.tab-switch",
  Search: "amp.console.navigation.search",
  FilterApplied: "amp.console.navigation.filter-applied",
  ContextSwitch: "amp.console.navigation.context-switch",
  DocsLinkClick: "amp.console.navigation.docs-link-click",

  // Intent — the counterpart to the backend's successful mutations
  DialogOpened: "amp.console.intent.dialog-opened",
  FormAbandoned: "amp.console.intent.form-abandoned",
  ValidationError: "amp.console.intent.validation-error",
  ConfirmationCancelled: "amp.console.intent.confirmation-cancelled",

  // Onboarding
  FirstSession: "amp.console.onboarding.first-session",
  WizardStepViewed: "amp.console.onboarding.wizard-step-viewed",
  WizardAbandoned: "amp.console.onboarding.wizard-abandoned",
  SampleSelected: "amp.console.onboarding.sample-selected",

  // Interactive surfaces (read paths the API does not track)
  TestInvoke: "amp.console.playground.test-invoke",
  TraceOpened: "amp.console.observability.trace-opened",
  LogQuery: "amp.console.observability.log-query",
  MetricsRangeChanged: "amp.console.observability.metrics-range-changed",
  EvalResultViewed: "amp.console.observability.eval-result-viewed",

  // Self-serve utility. Report which snippet was copied, never its value.
  CopySnippet: "amp.console.utility.copy-snippet",
  DownloadArtifact: "amp.console.utility.download-artifact",
  SecretRevealed: "amp.console.utility.secret-revealed",
  CliConnectViewed: "amp.console.utility.cli-connect-viewed",

  // Friction
  ErrorShown: "amp.console.friction.error-shown",
  EmptyState: "amp.console.friction.empty-state",
  PermissionDenied: "amp.console.friction.permission-denied",
  SessionExpired: "amp.console.friction.session-expired",
  ClientError: "amp.console.friction.client-error",

  // Session shape
  SessionStart: "amp.console.session.start",
  SessionEnd: "amp.console.session.end",
} as const;

export type ConsoleActionName =
  (typeof ConsoleAction)[keyof typeof ConsoleAction];

/** Flush cadence. Bounded by whichever comes first. */
const FLUSH_INTERVAL_MS = 5000;
/** Must not exceed the service's per-batch cap, which answers 413 above it. */
const MAX_BATCH_SIZE = 50;

/**
 * Module-level rather than component state: the buffer must survive re-renders
 * and must be shared by every `useTrack` caller in the tree, so that one
 * flush timer covers the whole app instead of one per component.
 */
let buffer: ConsoleActionPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * How a flush gets a token.
 *
 * Registered once by the app shell rather than read through `useAuthHooks`
 * inside `useTrack`, so that tracking a click costs a component nothing but a
 * function call. Components instrumented with `useTrack` — a copy button, a
 * confirmation dialog — must not inherit an auth-context dependency they
 * otherwise would not have; several are rendered bare in unit tests, and one
 * of them acquiring a provider requirement would break them for a reason that
 * has nothing to do with what they do.
 *
 * Unset (the default) means no token, so nothing is sent.
 */
let tokenProvider: (() => Promise<string>) | undefined;

/**
 * Registers the token source for telemetry flushes. Call once, high in the
 * provider stack, from a component that already has auth in context.
 */
export function setTelemetryTokenProvider(
  provider: (() => Promise<string>) | undefined,
): void {
  tokenProvider = provider;
}

/** Per-tab session id. Opaque, not derived from any credential. */
const sessionId = createSessionId();

function createSessionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // crypto.randomUUID needs a secure context; a plain random string is fine
    // since this only groups one tab's actions.
    return `s-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}

/**
 * Strips the query string from a route before it is reported. Console URLs
 * carry identifiers and filter values in the query, and telemetry has no
 * business exporting those.
 */
export function sanitizePage(path: string): string {
  return path.split("?")[0].split("#")[0];
}

/**
 * Segments whose *following* path element is an identifier rather than a
 * fixed part of the route.
 */
const ID_BEARING_SEGMENTS: Record<string, string> = {
  orgs: ":orgId",
  projects: ":projectId",
  agents: ":agentId",
  environment: ":envId",
  monitor: ":monitorId",
  traces: ":traceId",
  "llm-providers": ":providerId",
  "mcp-proxies": ":proxyId",
  gateways: ":gatewayId",
};

/**
 * Rewrites a concrete console path into its route template, e.g.
 * `/orgs/acme/projects/checkout/agents/router/deploy` →
 * `/orgs/:orgId/projects/:projectId/agents/:agentId/deploy`.
 *
 * Two reasons, both load-bearing. Analytics wants the template: a hundred
 * distinct agent URLs are one page, and the raw paths would shard every
 * page-view metric into single-hit buckets. And the concrete path carries
 * customer-chosen names — org, project and agent handles — which telemetry has
 * no reason to export. The organization is already identified server-side by
 * the token's company_id, so nothing is lost by dropping them.
 */
export function normalizeRoute(path: string): string {
  const segments = sanitizePage(path).split("/");
  return segments
    .map((segment, index) => {
      const parent = segments[index - 1];
      if (parent && ID_BEARING_SEGMENTS[parent] && segment !== "") {
        return ID_BEARING_SEGMENTS[parent];
      }
      return segment;
    })
    .join("/");
}

export function isConsoleAnalyticsEnabled(): boolean {
  // globalConfig is window.__RUNTIME_CONFIG__, injected by config.js before
  // React mounts — but only in the real app. Under Vitest nothing injects it,
  // so a bare property read throws. Since useTrack is embedded in low-level
  // shared components (a copy button, a confirmation dialog) that are rendered
  // without any app shell in their own unit tests, this must degrade to
  // "disabled" rather than take those components down.
  try {
    return globalConfig?.analyticsEnabled === true;
  } catch {
    return false;
  }
}

/**
 * `useTrack` returns a stable `track(action, dimensions)` for reporting one
 * console interaction.
 *
 * The returned function never throws and never awaits anything the caller
 * cares about: it appends to the shared buffer and returns. Callers can wire
 * it straight into an onClick.
 */
export function useTrack() {
  const enabled = isConsoleAnalyticsEnabled();

  const flush = useCallback(async () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = undefined;
    }
    if (buffer.length === 0) {
      return;
    }

    // Take the buffer before awaiting: actions reported while the flush is in
    // flight belong to the next batch, not this one, and must not be lost to
    // a clear-after-send.
    const batch = buffer;
    buffer = [];

    try {
      await reportConsoleActions(batch, tokenProvider);
    } catch {
      // Deliberately swallowed and not retried — see the module comment. The
      // batch is already detached, so it is simply dropped.
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimer) {
      return;
    }
    flushTimer = setTimeout(() => {
      void flush();
    }, FLUSH_INTERVAL_MS);
  }, [flush]);

  const track = useCallback(
    (
      action: ConsoleActionName,
      dimensions?: Record<string, ConsoleActionDimensionValue>,
      page?: string,
    ) => {
      if (!enabled) {
        return;
      }
      try {
        buffer.push({
          action,
          occurredAt: new Date().toISOString(),
          page: normalizeRoute(page ?? window.location.pathname),
          sessionId,
          dimensions,
        });

        if (buffer.length >= MAX_BATCH_SIZE) {
          void flush();
          return;
        }
        scheduleFlush();
      } catch {
        // A broken tracking call must never break the interaction it measures.
      }
    },
    [enabled, flush, scheduleFlush],
  );

  // Flush on the way out. `pagehide` rather than `beforeunload`: it fires for
  // back/forward-cache navigations too, which `beforeunload` misses, and it
  // does not suppress the bfcache the way a beforeunload handler can.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onPageHide = () => {
      if (buffer.length === 0) {
        return;
      }
      const batch = buffer;
      buffer = [];
      // No await is possible here, so the token must already be in hand.
      void Promise.resolve(tokenProvider?.())
        .then((token) => reportConsoleActionsOnUnload(batch, token))
        .catch(() => false);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flush();
      }
    };

    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, flush]);

  return useMemo(() => ({ track, flush, sessionId }), [track, flush]);
}

/**
 * Reports a page view whenever `path` changes.
 *
 * Mount this once, high in the router, rather than calling it per page: one
 * caller means one event per navigation, and a page that forgets to call it
 * simply cannot go missing from the data.
 */
export function usePageViewTracking(path: string, entityScope?: string) {
  const { track } = useTrack();
  const previous = useRef<string | undefined>(undefined);

  useEffect(() => {
    const route = normalizeRoute(path);
    if (previous.current === route) {
      return;
    }

    track(
      ConsoleAction.PageView,
      {
        route,
        ...(entityScope ? { entity_scope: entityScope } : {}),
        ...(previous.current ? { referrer_route: previous.current } : {}),
      },
      route,
    );
    previous.current = route;
  }, [path, entityScope, track]);
}
