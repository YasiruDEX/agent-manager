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

import { Collapse, Form, FormControlLabel, Stack, Switch, Typography } from "@wso2/oxygen-ui";
import type { MonitorEvaluator } from "@agent-management-platform/types";
import { MonitorWatchSettings, type WatchSettingsValue } from "./MonitorWatchSettings";

interface MonitorWatchFormSectionProps {
  watching: boolean;
  onWatchingChange: (watching: boolean) => void;
  settings: WatchSettingsValue;
  onSettingsChange: (settings: WatchSettingsValue) => void;
  /** The evaluators selected for the monitor. */
  evaluators: MonitorEvaluator[];
  showErrors: boolean;
}

/** The monitor form's section for the caller's own watch on the monitor. */
export function MonitorWatchFormSection({
  watching,
  onWatchingChange,
  settings,
  onSettingsChange,
  evaluators,
  showErrors,
}: MonitorWatchFormSectionProps) {
  return (
    <Form.Section>
      <Form.Header>Notifications</Form.Header>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <FormControlLabel
            control={
              <Switch checked={watching} onChange={(e) => onWatchingChange(e.target.checked)} />
            }
            label="Watch this monitor"
          />
          <Typography variant="body2" color="text.secondary">
            Get notified in the console about this monitor&apos;s runs. These settings are yours
            alone, and you can change them later with the Watch button on the monitor page.
          </Typography>
        </Stack>
        <Collapse in={watching} unmountOnExit>
          <MonitorWatchSettings
            value={settings}
            onChange={onSettingsChange}
            evaluators={evaluators}
            showErrors={showErrors}
          />
        </Collapse>
      </Stack>
    </Form.Section>
  );
}
