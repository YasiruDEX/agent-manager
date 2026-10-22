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

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  IconButton,
  NotificationPanel,
  Tooltip,
} from "@wso2/oxygen-ui";
import { Bell } from "@wso2/oxygen-ui-icons-react";
import { formatDistanceToNow } from "date-fns";
import { generatePath, useNavigate } from "react-router-dom";
import {
  useListNotifications,
  useMarkAllNotificationsRead,
  useNotificationsEnabled,
  useSetNotificationRead,
  useUnreadNotificationCount,
} from "@agent-management-platform/api-client";
import {
  absoluteRouteMap,
  type NotificationKind,
  type NotificationResponse,
} from "@agent-management-platform/types";

const PAGE_SIZE = 20;

const KIND_TYPE: Record<NotificationKind, "info" | "success" | "warning" | "error"> = {
  monitor_run_failed: "error",
  monitor_run_succeeded: "success",
  score_breached: "warning",
  score_recovered: "success",
};

const monitorView =
  absoluteRouteMap.children.org.children.projects.children.agents.children
    .environment.children.evaluation.children.monitor.children.view;

/** Where a notification leads: the monitor, or the run it is about. */
function notificationLink(orgId: string, n: NotificationResponse): string | undefined {
  const m = n.monitor;
  if (!m?.environmentName) return undefined;
  const params = {
    orgId,
    projectId: m.projectName,
    agentId: m.agentName,
    envId: m.environmentName,
    monitorId: m.monitorName,
  };
  if (m.runId) {
    const runs = generatePath(monitorView.children.runs.path, params);
    return `${runs}?runId=${encodeURIComponent(m.runId)}`;
  }
  return generatePath(monitorView.path, params);
}

interface NotificationCenterProps {
  orgId: string | undefined;
}

/**
 * The bell in the header and the panel it opens: the caller's notifications
 * about the monitors they watch.
 */
export function NotificationCenter({ orgId }: NotificationCenterProps) {
  const enabled = useNotificationsEnabled();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [pages, setPages] = useState(1);
  const unreadOnly = tab === 1;

  const { data: unread } = useUnreadNotificationCount(orgId, enabled);
  const { data: list, isLoading } = useListNotifications(
    orgId,
    { unread: unreadOnly, limit: PAGE_SIZE * pages },
    { enabled: enabled && open, poll: open },
  );
  const setRead = useSetNotificationRead(orgId);
  const markAllRead = useMarkAllNotificationsRead(orgId);

  if (!enabled || !orgId) return null;

  const unreadCount = unread?.count ?? 0;
  const notifications = list?.notifications ?? [];
  const hasMore = (list?.total ?? 0) > notifications.length;

  const handleOpen = (n: NotificationResponse) => {
    const link = notificationLink(orgId, n);
    if (!link) return;
    setOpen(false);
    navigate(link);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton aria-label="Notifications" onClick={() => setOpen(true)}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={20} />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationPanel open={open} onClose={() => setOpen(false)}>
        <NotificationPanel.Header>
          <NotificationPanel.HeaderIcon>
            <Bell size={20} />
          </NotificationPanel.HeaderIcon>
          <NotificationPanel.HeaderTitle>Notifications</NotificationPanel.HeaderTitle>
          {unreadCount > 0 && (
            <NotificationPanel.HeaderBadge color="error">
              {unreadCount}
            </NotificationPanel.HeaderBadge>
          )}
          <NotificationPanel.HeaderClose onClick={() => setOpen(false)} />
        </NotificationPanel.Header>
        <NotificationPanel.Tabs
          tabs={[
            { label: "All" },
            { label: "Unread", count: unreadCount, color: "error" },
          ]}
          value={tab}
          onChange={(index) => {
            setTab(index);
            setPages(1);
          }}
        />
        <NotificationPanel.Actions
          hasUnread={unreadCount > 0}
          onMarkAllRead={() => markAllRead.mutate()}
        />
        {notifications.length === 0 && !isLoading ? (
          <NotificationPanel.EmptyState
            message={
              unreadOnly
                ? "You're all caught up."
                : "No notifications yet. Watch a monitor to be notified about its runs."
            }
          />
        ) : (
          <NotificationPanel.List>
            {notifications.map((n) => (
              <NotificationPanel.Item
                key={n.id}
                id={n.id}
                type={KIND_TYPE[n.kind] ?? "info"}
                read={n.read}
                onMarkRead={(id) => setRead.mutate({ id, read: true })}
                onAction={() => handleOpen(n)}
              >
                <NotificationPanel.ItemAvatar />
                <NotificationPanel.ItemTitle>{n.title}</NotificationPanel.ItemTitle>
                <NotificationPanel.ItemMessage>
                  <Box component="span" sx={{ whiteSpace: "pre-line" }}>
                    {n.body}
                  </Box>
                </NotificationPanel.ItemMessage>
                <NotificationPanel.ItemTimestamp>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </NotificationPanel.ItemTimestamp>
                <NotificationPanel.ItemAction
                  onClick={(e) => {
                    // Toggle without opening the notification.
                    e.stopPropagation();
                    setRead.mutate({ id: n.id, read: !n.read });
                  }}
                >
                  {n.read ? "Mark as unread" : "Mark as read"}
                </NotificationPanel.ItemAction>
              </NotificationPanel.Item>
            ))}
          </NotificationPanel.List>
        )}
        {hasMore && (
          <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
            <Button size="small" onClick={() => setPages((p) => p + 1)}>
              Load more
            </Button>
          </Box>
        )}
      </NotificationPanel>
    </>
  );
}
