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

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@wso2/oxygen-ui";
import { Bell, BellRing } from "@wso2/oxygen-ui-icons-react";
import { DrawerContent, DrawerHeader, DrawerWrapper } from "@agent-management-platform/views";
import {
  useDeleteMonitorWatch,
  useMonitorWatch,
  useNotificationsEnabled,
  useSaveMonitorWatch,
} from "@agent-management-platform/api-client";
import type { MonitorEvaluator } from "@agent-management-platform/types";
import {
  MonitorWatchSettings,
  defaultWatchSettings,
  hasWatchSettingsErrors,
  thresholdKey,
  toWatchRequest,
  validateWatchSettings,
  watchSettingsFromResponse,
  type WatchSettingsValue,
} from "./MonitorWatchSettings";

interface MonitorWatchButtonProps {
  orgName: string | undefined;
  projName: string | undefined;
  agentName: string | undefined;
  monitorName: string | undefined;
  monitorDisplayName: string | undefined;
  evaluators: MonitorEvaluator[];
}

/**
 * Lets the caller watch the monitor: be notified in the console when its runs
 * fail, complete, or cross score thresholds they set.
 */
export function MonitorWatchButton({
  orgName,
  projName,
  agentName,
  monitorName,
  monitorDisplayName,
  evaluators,
}: MonitorWatchButtonProps) {
  const enabled = useNotificationsEnabled();
  const params = useMemo(
    () => ({ orgName, projName, agentName, monitorName }),
    [orgName, projName, agentName, monitorName],
  );
  const { data: watch, isLoading } = useMonitorWatch(params, enabled);
  const save = useSaveMonitorWatch(params);
  const unwatch = useDeleteMonitorWatch(params);

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<WatchSettingsValue>(defaultWatchSettings);
  const [submitted, setSubmitted] = useState(false);

  // Load the saved settings each time the drawer opens.
  useEffect(() => {
    if (!open || !watch) return;
    setSettings(watchSettingsFromResponse(watch));
    setSubmitted(false);
  }, [open, watch]);

  const breached = useMemo(
    () => new Set((watch?.breached ?? []).map(thresholdKey)),
    [watch?.breached],
  );

  if (!enabled) return null;

  const watching = watch?.watching === true;

  const handleSave = () => {
    setSubmitted(true);
    if (hasWatchSettingsErrors(validateWatchSettings(settings, evaluators))) return;
    save.mutate(toWatchRequest(settings), { onSuccess: () => setOpen(false) });
  };

  const handleUnwatch = () => unwatch.mutate(undefined, { onSuccess: () => setOpen(false) });

  return (
    <>
      <Tooltip
        title={
          watching
            ? "You are notified about this monitor's runs"
            : "Get notified about this monitor's runs"
        }
      >
        <span>
          <Button
            size="small"
            variant={watching ? "contained" : "outlined"}
            startIcon={watching ? <BellRing size={16} /> : <Bell size={16} />}
            onClick={() => setOpen(true)}
            disabled={isLoading}
          >
            {watching ? "Watching" : "Watch"}
          </Button>
        </span>
      </Tooltip>
      <DrawerWrapper open={open} onClose={() => setOpen(false)} maxWidth={720}>
        <DrawerHeader
          icon={<Bell size={24} />}
          title={`Watch ${monitorDisplayName ?? monitorName ?? "monitor"}`}
          onClose={() => setOpen(false)}
        />
        <DrawerContent>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Get notified in the console about this monitor&apos;s runs. Your watch settings and
              notifications are yours alone; other people watching this monitor set their own.
            </Typography>
            <Divider />
            <MonitorWatchSettings
              value={settings}
              onChange={setSettings}
              evaluators={evaluators}
              breached={breached}
              showErrors={submitted}
            />
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Box>
                {watching && (
                  <Button color="error" onClick={handleUnwatch} disabled={unwatch.isPending}>
                    Stop watching
                  </Button>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={save.isPending}
                  startIcon={save.isPending ? <CircularProgress size={14} /> : undefined}
                >
                  {watching ? "Save" : "Watch"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </DrawerContent>
      </DrawerWrapper>
    </>
  );
}
