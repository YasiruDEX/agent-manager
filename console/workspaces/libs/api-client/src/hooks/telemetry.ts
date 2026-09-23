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

import { useCallback, useEffect, useMemo, useRef } from "react";
import { absoluteRouteMap } from "@agent-management-platform/types";
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

/** Session shape counters, reported once by session.end. */
const sessionStats = { startedAt: Date.now(), pages: 0, actions: 0 };

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
 * Every absolute route template the app declares, longest first so the most
 * specific match wins.
 *
 * Derived from the generated route map rather than hand-listed. A hand-listed
 * set silently stops covering routes as they are added or renamed, and the
 * failure mode is not a missing metric — it is a customer's org, project or
 * agent name being exported to Moesif in a URL.
 */
const ROUTE_TEMPLATES: string[] = (() => {
  const out: string[] = [];
  const walk = (node: { path?: string; children?: Record<string, unknown> }) => {
    if (typeof node?.path === "string" && node.path.startsWith("/")) {
      out.push(node.path);
    }
    for (const child of Object.values(node?.children ?? {})) {
      walk(child as { path?: string; children?: Record<string, unknown> });
    }
  };
  try {
    walk(absoluteRouteMap as unknown as { path?: string; children?: Record<string, unknown> });
  } catch {
    // A malformed map must not stop the console from booting; normalizeRoute
    // falls back to masking every unrecognized segment.
  }
  return out.sort((a, b) => b.length - a.length);
})();

/** The static (non-parameter) segments of every declared route. */
const STATIC_SEGMENTS: Set<string> = new Set(
  ROUTE_TEMPLATES.flatMap((template) =>
    template.split("/").filter((segment) => segment && !segment.startsWith(":")),
  ),
);

function segmentsMatchTemplate(path: string[], template: string[]): boolean {
  if (path.length !== template.length) return false;
  return template.every(
    (segment, i) => segment.startsWith(":") || segment === path[i],
  );
}

/**
 * Rewrites a concrete console path into its route template, e.g.
 * `/org/acme/project/checkout/agents/router/deploy` →
 * `/org/:orgId/project/:projectId/agents/:agentId/deploy`.
 *
 * Two reasons, both load-bearing. Analytics wants the template: a hundred
 * distinct agent URLs are one page, and the raw paths would shard every
 * page-view metric into single-hit buckets. And the concrete path carries
 * customer-chosen names — org, project and agent handles — which telemetry has
 * no reason to export. The organization is already identified server-side by
 * the token's company_id, so nothing is lost by dropping them.
 *
 * Matching is against the declared templates first. When nothing matches — a
 * path deeper than the map, or a route added outside it — every segment that
 * is not a known static segment is masked as `:id`. That fallback is a
 * whitelist on purpose: an unrecognized segment is far more likely to be an
 * identifier than a new keyword, and guessing wrong in the other direction
 * leaks it.
 */
export function normalizeRoute(path: string): string {
  const clean = sanitizePage(path);
  const segments = clean.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  for (const template of ROUTE_TEMPLATES) {
    const templateSegments = template.split("/").filter(Boolean);
    if (segmentsMatchTemplate(segments, templateSegments)) {
      return "/" + templateSegments.join("/");
    }
  }

  return (
    "/" +
    segments
      .map((segment) => (STATIC_SEGMENTS.has(segment) ? segment : ":id"))
      .join("/")
  );
}

/**
 * Whether this deployment accepts console analytics, as reported by the
 * service's runtime-config discovery call at bootstrap.
 *
 * There is deliberately no console-side flag for this. The service's
 * CONSOLE_ANALYTICS_ENABLED is the single switch for the whole path: a second
 * one here could disagree with it, and an operator who set the documented flag
 * would still get nothing. Defaults to false, so the console reports nothing
 * until discovery says otherwise — including when discovery fails.
 */
let consoleAnalyticsEnabled = false;

/** Set once by the runtime-config bootstrap. */
export function setConsoleAnalyticsEnabled(enabled: boolean | undefined): void {
  consoleAnalyticsEnabled = enabled === true;
}

export function isConsoleAnalyticsEnabled(): boolean {
  return consoleAnalyticsEnabled;
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
    if (!tokenProvider) {
      // Nothing has registered a token source yet (pre-auth, or a tree without
      // the app shell). Sending now would post the batch with no Authorization
      // header and be rejected, so drop it instead of holding actions that
      // will only grow staler.
      buffer = [];
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

        sessionStats.actions += 1;
        if (action === ConsoleAction.PageView) {
          sessionStats.pages += 1;
        }

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

  /**
   * Sends whatever is buffered in a way that survives document teardown.
   *
   * Exposed rather than kept private to the unload listener below because
   * useSessionAnalytics has to append session.end *after* this hook's own
   * listener has already run — listener order follows registration order, and
   * this hook registers first — so it needs to trigger a second, final send
   * itself. Without that, the last action of every session is the one that
   * never arrives.
   */
  const flushOnUnload = useCallback(() => {
    if (buffer.length === 0) {
      return;
    }
    const batch = buffer;
    buffer = [];
    // No await is possible here, so the token must already be in hand.
    void Promise.resolve(tokenProvider?.())
      .then((token) => reportConsoleActionsOnUnload(batch, token))
      .catch(() => false);
  }, []);

  // Flush on the way out. `pagehide` rather than `beforeunload`: it fires for
  // back/forward-cache navigations too, which `beforeunload` misses, and it
  // does not suppress the bfcache the way a beforeunload handler can.
  useEffect(() => {
    if (!enabled) {
      return;
    }


    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Not flush(): in Chromium a closing tab can fire visibilitychange
        // before pagehide, and flush() awaits the token before sending, so the
        // request is cancelled during teardown while the buffer it already
        // took is gone. flushOnUnload survives teardown and is equally correct
        // when the tab merely goes to the background.
        flushOnUnload();
      }
    };

    window.addEventListener("pagehide", flushOnUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushOnUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, flush, flushOnUnload]);

  return useMemo(
    () => ({ track, flush, flushOnUnload, sessionId }),
    [track, flush, flushOnUnload],
  );
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

/**
 * Tracks a create/edit dialog as an intent funnel.
 *
 * Opening reports `dialog-opened`; closing without a completed submission
 * reports `form-abandoned`. Pairing those with the backend's own success event
 * for the same entity is what turns "N agents were created" into a conversion
 * rate — the abandonment is invisible server-side, because giving up issues no
 * request.
 *
 * Call `markCompleted()` from the success path (a mutation's `onSuccess`)
 * before the dialog closes. Anything else — Cancel, Escape, a click outside —
 * is an abandonment by definition, so no call site has to remember to report
 * one.
 *
 * `step` is optional and, when supplied, rides along as `furthest_step` so a
 * multi-step form says where the user stopped.
 */
export function useDialogAnalytics(
  entity: string,
  isOpen: boolean,
  options?: { trigger?: string; step?: string },
) {
  const { track } = useTrack();
  const completed = useRef(false);
  const openedAt = useRef<number | undefined>(undefined);
  const wasOpen = useRef(false);
  // Read inside the effect without making it a dependency: a step that changes
  // as the user advances must not re-fire the open/abandon transitions.
  const latest = useRef(options);
  latest.current = options;

  const markCompleted = useCallback(() => {
    completed.current = true;
  }, []);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      wasOpen.current = true;
      completed.current = false;
      openedAt.current = Date.now();
      track(ConsoleAction.DialogOpened, {
        entity,
        trigger: latest.current?.trigger ?? "unspecified",
      });
      return;
    }

    if (!isOpen && wasOpen.current) {
      wasOpen.current = false;
      if (!completed.current) {
        track(ConsoleAction.FormAbandoned, {
          entity,
          furthest_step: latest.current?.step ?? "unspecified",
          seconds_on_form: openedAt.current
            ? Math.round((Date.now() - openedAt.current) / 1000)
            : 0,
        });
      }
    }
  }, [isOpen, entity, track]);

  return { markCompleted };
}

/**
 * Reports a validation error the user was shown. Call from a form's own
 * validation, with the field name — never the value the user typed.
 */
export function useValidationErrorTracking(entity: string) {
  const { track } = useTrack();
  return useCallback(
    (field: string) => {
      track(ConsoleAction.ValidationError, { entity, field });
    },
    [track, entity],
  );
}

/** localStorage key marking that this browser has seen the console before. */
const SEEN_KEY = "amp.console.seen";

/** localStorage key holding a pending session-expiry record. */
const EXPIRY_KEY = "amp.console.session-expired";

/**
 * A session expiry older than this is dropped rather than reported. The record
 * is meant to survive a sign-in redirect, not to resurface weeks later against
 * an unrelated session.
 */
const EXPIRY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Records that this session ended because the user's credentials stopped being
 * accepted. Deliberately *not* reported at the moment it happens.
 *
 * A session-expired action cannot be delivered using the session that just
 * expired: the flush would either authenticate with the token the API just
 * rejected (so the telemetry call 401s too) or find the token provider already
 * torn down by logout and drop the buffer. Either way the event is lost, and
 * with several queries failing at once each one would try — and lose — its own
 * copy.
 *
 * So the fact is parked in localStorage and reported at the start of the next
 * session, when there is a valid token to send it with. Writing to a single key
 * also collapses the concurrent-failure case into one record rather than one
 * per in-flight query.
 */
export function markSessionExpired(route: string): void {
  try {
    window.localStorage.setItem(
      EXPIRY_KEY,
      JSON.stringify({ route: normalizeRoute(route), at: Date.now() }),
    );
  } catch {
    // Blocked storage: the expiry simply goes unreported.
  }
}

/**
 * Reads and clears a pending expiry record, if one is recent enough to report.
 */
function takePendingSessionExpiry(): { route: string } | undefined {
  try {
    const raw = window.localStorage.getItem(EXPIRY_KEY);
    if (!raw) return undefined;
    window.localStorage.removeItem(EXPIRY_KEY);

    const parsed = JSON.parse(raw) as { route?: unknown; at?: unknown };
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > EXPIRY_MAX_AGE_MS) {
      return undefined;
    }
    return { route: typeof parsed.route === "string" ? parsed.route : "unspecified" };
  } catch {
    return undefined;
  }
}

/**
 * Session-level telemetry: start, first-ever session, uncaught client errors,
 * and the end-of-session summary.
 *
 * Mounted once by the app shell. Everything here is either a one-shot or a
 * listener, so mounting it twice would double-count — hence one caller, high
 * up, rather than a hook pages opt into.
 */
export function useSessionAnalytics() {
  const { track, flushOnUnload } = useTrack();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let firstEver = false;
    try {
      firstEver = window.localStorage.getItem(SEEN_KEY) === null;
      if (firstEver) window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Private mode or blocked storage: treat as a returning user rather than
      // reporting a first session on every load, which would be worse data.
    }

    track(ConsoleAction.SessionStart, {
      referrer: safeReferrerHost(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent.slice(0, 120),
    });

    if (firstEver) {
      track(ConsoleAction.FirstSession, { referrer: safeReferrerHost() });
    }

    // Reported here rather than when it happened — see markSessionExpired.
    // The route is the (normalized) page the user was on when they were kicked
    // out, which is the part worth knowing.
    const expired = takePendingSessionExpiry();
    if (expired) {
      track(ConsoleAction.SessionExpired, { page: expired.route });
    }
  }, [track]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      track(ConsoleAction.ClientError, {
        component: "window",
        // The error name only. A message can quote page data, and a stack
        // names internals that belong in logs rather than in analytics.
        error_name: event.error?.name ?? "Error",
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { name?: string } | undefined;
      track(ConsoleAction.ClientError, {
        component: "promise",
        error_name: reason?.name ?? "UnhandledRejection",
      });
    };
    const onPageHide = () => {
      track(ConsoleAction.SessionEnd, {
        duration_seconds: Math.round((Date.now() - sessionStats.startedAt) / 1000),
        page_count: sessionStats.pages,
        action_count: sessionStats.actions,
      });
      // This hook's listener runs after useTrack's, which has already emptied
      // the buffer, so session.end needs its own unload-safe send.
      flushOnUnload();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [track, flushOnUnload]);
}

/**
 * The referring site's host, never its full URL — a referrer can carry a
 * search query or a path that identifies the person who followed it.
 */
function safeReferrerHost(): string {
  try {
    return document.referrer ? new URL(document.referrer).host : "direct";
  } catch {
    return "unknown";
  }
}
