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

import { useCallback, useEffect, useRef } from "react";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { useConfirmationDialog } from "../components/ConfirmationDialog/ConfirmationDialogProvider";

type ShowLeaveDialog = (onLeave: () => void) => void;

// Module-level so every mounted guard shares one History API patch and one
// dialog, however many dirty forms (e.g. nested tabs) are on screen.
const activeGuards = new Set<symbol>();
let showLeaveDialog: ShowLeaveDialog | null = null;
let routerNavigate: NavigateFunction | null = null;
let dialogOpen = false;
let bypass = false;
let originalPushState: History["pushState"] | null = null;
let originalReplaceState: History["replaceState"] | null = null;

function runUnguarded(action: () => void) {
  bypass = true;
  try {
    action();
  } finally {
    bypass = false;
  }
}

function openLeaveDialog(onLeave: () => void) {
  if (dialogOpen || !showLeaveDialog) return;
  dialogOpen = true;
  showLeaveDialog(() => runUnguarded(onLeave));
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
}

// BrowserRouter has no useBlocker, so in-app navigation (links, sidebar,
// navigate(), query-string tab switches) is caught at the History API. A
// blocked push leaves the URL untouched, so the router re-renders in place.
function interceptHistory(replace: boolean): History["pushState"] {
  return (data, unused, url) => {
    const original = (replace ? originalReplaceState : originalPushState)!;
    if (bypass || url == null) {
      original(data, unused, url);
      return;
    }
    const target = new URL(String(url), window.location.href);
    const current = new URL(window.location.href);
    if (target.pathname === current.pathname && target.search === current.search) {
      original(data, unused, url);
      return;
    }
    const usr = (data as { usr?: unknown } | null)?.usr;
    openLeaveDialog(() =>
      routerNavigate?.(`${target.pathname}${target.search}${target.hash}`, {
        replace,
        state: usr,
      }),
    );
  };
}

function install() {
  originalPushState = window.history.pushState.bind(window.history);
  originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = interceptHistory(false);
  window.history.replaceState = interceptHistory(true);
  window.addEventListener("beforeunload", handleBeforeUnload);
}

function uninstall() {
  if (originalPushState) window.history.pushState = originalPushState;
  if (originalReplaceState) window.history.replaceState = originalReplaceState;
  originalPushState = null;
  originalReplaceState = null;
  window.removeEventListener("beforeunload", handleBeforeUnload);
}

function useLeaveDialog(): ShowLeaveDialog {
  const { addConfirmation } = useConfirmationDialog();
  return useCallback(
    (onLeave: () => void) =>
      addConfirmation({
        title: "You have unsaved changes",
        description:
          "Your changes haven't been saved. If you leave now, they will be lost.",
        confirmButtonText: "Leave",
        confirmButtonColor: "error",
        cancelButtonText: "Stay",
        onConfirm: () => {
          dialogOpen = false;
          onLeave();
        },
        onCancel: () => {
          dialogOpen = false;
        },
      }),
    [addConfirmation],
  );
}

/**
 * Asks "You have unsaved changes — Stay / Leave?" before the user navigates
 * away from a form while `isDirty` is true, and shows the browser's native
 * prompt on reload or tab close.
 *
 * Call `allowNavigation(fn)` around a navigation the form triggers itself
 * (e.g. redirecting after a successful save), since `isDirty` is typically
 * still true in that same tick.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigate = useNavigate();
  const leaveDialog = useLeaveDialog();
  const idRef = useRef(Symbol("unsaved-changes-guard"));

  useEffect(() => {
    if (!isDirty) return undefined;
    const id = idRef.current;
    showLeaveDialog = leaveDialog;
    routerNavigate = navigate;
    if (activeGuards.size === 0) install();
    activeGuards.add(id);
    return () => {
      activeGuards.delete(id);
      if (activeGuards.size === 0) uninstall();
    };
  }, [isDirty, leaveDialog, navigate]);

  const allowNavigation = useCallback((action: () => void) => {
    runUnguarded(action);
  }, []);

  return { allowNavigation };
}

/**
 * For in-page switches that don't change the URL (e.g. tabs held in local
 * state): runs `action` straight away when no form is dirty, otherwise only
 * after the user chooses Leave.
 */
export function useConfirmIfUnsaved() {
  const leaveDialog = useLeaveDialog();
  return useCallback(
    (action: () => void) => {
      if (activeGuards.size === 0) {
        action();
        return;
      }
      showLeaveDialog ??= leaveDialog;
      openLeaveDialog(action);
    },
    [leaveDialog],
  );
}
