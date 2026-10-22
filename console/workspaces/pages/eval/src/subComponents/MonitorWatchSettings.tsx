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

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { Plus, Trash2 } from "@wso2/oxygen-ui-icons-react";
import type {
  MonitorEvaluator,
  MonitorScoreThreshold,
  MonitorWatchRequest,
  MonitorWatchResponse,
  ScoreThresholdAggregation,
  ScoreThresholdOperator,
} from "@agent-management-platform/types";

const MAX_THRESHOLDS = 20;

/** A threshold row being edited; the value is kept as typed. */
export interface ThresholdRow {
  key: number;
  evaluator: string;
  aggregation: ScoreThresholdAggregation;
  operator: ScoreThresholdOperator;
  value: string;
}

/** The watch settings being edited. */
export interface WatchSettingsValue {
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  thresholds: ThresholdRow[];
}

const AGGREGATIONS: { value: ScoreThresholdAggregation; label: string }[] = [
  { value: "mean", label: "Mean score" },
  { value: "pass_rate", label: "Pass rate" },
];

let nextRowKey = 0;

const toRow = (t: MonitorScoreThreshold): ThresholdRow => ({
  key: nextRowKey++,
  evaluator: t.evaluator,
  aggregation: t.aggregation,
  operator: t.operator,
  value: String(t.value),
});

const comparisonKey = (t: { evaluator: string; aggregation: string; operator: string }) =>
  `${t.evaluator}|${t.aggregation}|${t.operator}`;

/** Identifies a saved threshold, to mark the ones the latest run breached. */
export const thresholdKey = (t: MonitorScoreThreshold) => `${comparisonKey(t)}|${t.value}`;

/** The settings a new watch starts with: failures only. */
export function defaultWatchSettings(): WatchSettingsValue {
  return { notifyOnFailure: true, notifyOnSuccess: false, thresholds: [] };
}

export function watchSettingsFromResponse(watch: MonitorWatchResponse): WatchSettingsValue {
  return {
    notifyOnFailure: watch.notifyOnFailure,
    notifyOnSuccess: watch.notifyOnSuccess,
    thresholds: watch.thresholds.map(toRow),
  };
}

export function toWatchRequest(value: WatchSettingsValue): MonitorWatchRequest {
  return {
    notifyOnFailure: value.notifyOnFailure,
    notifyOnSuccess: value.notifyOnSuccess,
    thresholds: value.thresholds.map((r) => ({
      evaluator: r.evaluator,
      aggregation: r.aggregation,
      operator: r.operator,
      value: Number(r.value),
    })),
  };
}

export interface WatchSettingsErrors {
  rows: (string | undefined)[];
  /** Nothing would ever notify. */
  nothingSelected: boolean;
}

/** Checks the settings against the monitor's evaluators. */
export function validateWatchSettings(
  value: WatchSettingsValue,
  evaluators: MonitorEvaluator[],
): WatchSettingsErrors {
  const names = new Set(evaluators.map((e) => e.displayName));
  const counts = new Map<string, number>();
  value.thresholds.forEach((r) =>
    counts.set(comparisonKey(r), (counts.get(comparisonKey(r)) ?? 0) + 1),
  );
  const rows = value.thresholds.map((r) => {
    if (!r.evaluator || !names.has(r.evaluator)) return "Choose one of the monitor's evaluators";
    const v = Number(r.value);
    if (r.value.trim() === "" || Number.isNaN(v) || v < 0 || v > 1) {
      return "Enter a value between 0 and 1";
    }
    if ((counts.get(comparisonKey(r)) ?? 0) > 1) return "Another threshold already checks this";
    return undefined;
  });
  return {
    rows,
    nothingSelected:
      !value.notifyOnFailure && !value.notifyOnSuccess && value.thresholds.length === 0,
  };
}

export function hasWatchSettingsErrors(errors: WatchSettingsErrors): boolean {
  return errors.nothingSelected || errors.rows.some(Boolean);
}

interface MonitorWatchSettingsProps {
  value: WatchSettingsValue;
  onChange: (value: WatchSettingsValue) => void;
  /** The monitor's evaluators, which thresholds can be set on. */
  evaluators: MonitorEvaluator[];
  /** Keys (thresholdKey) of the thresholds the latest run breached. */
  breached?: Set<string>;
  /** Show validation errors, once the user has tried to save. */
  showErrors: boolean;
}

/**
 * What a watcher is notified about: failed runs, completed runs, and score
 * thresholds. Used by the monitor page's Watch drawer and the monitor form.
 */
export function MonitorWatchSettings({
  value,
  onChange,
  evaluators,
  breached,
  showErrors,
}: MonitorWatchSettingsProps) {
  const errors = validateWatchSettings(value, evaluators);

  const updateRow = (key: number, patch: Partial<ThresholdRow>) =>
    onChange({
      ...value,
      thresholds: value.thresholds.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    });

  const addRow = () =>
    onChange({
      ...value,
      thresholds: [
        ...value.thresholds,
        {
          key: nextRowKey++,
          evaluator: evaluators[0]?.displayName ?? "",
          aggregation: "mean",
          operator: "below",
          value: "0.7",
        },
      ],
    });

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Runs</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={value.notifyOnFailure}
              onChange={(e) => onChange({ ...value, notifyOnFailure: e.target.checked })}
            />
          }
          label="When a run fails or cannot start"
        />
        <FormControlLabel
          control={
            <Switch
              checked={value.notifyOnSuccess}
              onChange={(e) => onChange({ ...value, notifyOnSuccess: e.target.checked })}
            />
          }
          label="Every time a run completes"
        />
      </Stack>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="subtitle2">Score thresholds</Typography>
          <Typography variant="body2" color="text.secondary">
            You are notified when a run&apos;s score crosses a threshold, and again when it is
            back within it, not on every run. Scores range from 0 to 1.
          </Typography>
        </Box>
        {evaluators.length === 0 && (
          <Alert severity="info">Select evaluators to set score thresholds on them.</Alert>
        )}
        {value.thresholds.map((row, i) => {
          const error = showErrors ? errors.rows[i] : undefined;
          const isBreached = breached?.has(
            thresholdKey({
              evaluator: row.evaluator,
              aggregation: row.aggregation,
              operator: row.operator,
              value: Number(row.value),
            }),
          );
          return (
            <Stack key={row.key} spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  select
                  size="small"
                  label="Evaluator"
                  value={row.evaluator}
                  onChange={(e) => updateRow(row.key, { evaluator: e.target.value })}
                  error={!!error && error.includes("evaluators")}
                  sx={{ flex: 2, minWidth: 0 }}
                >
                  {evaluators.map((ev) => (
                    <MenuItem key={ev.displayName} value={ev.displayName}>
                      {ev.displayName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Score"
                  value={row.aggregation}
                  onChange={(e) =>
                    updateRow(row.key, {
                      aggregation: e.target.value as ScoreThresholdAggregation,
                    })
                  }
                  sx={{ flex: 1.3, minWidth: 0 }}
                >
                  {AGGREGATIONS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Notify when"
                  value={row.operator}
                  onChange={(e) =>
                    updateRow(row.key, { operator: e.target.value as ScoreThresholdOperator })
                  }
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <MenuItem value="below">Below</MenuItem>
                  <MenuItem value="above">Above</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  label="Value"
                  type="number"
                  value={row.value}
                  onChange={(e) => updateRow(row.key, { value: e.target.value })}
                  error={!!error && error.includes("between")}
                  slotProps={{ htmlInput: { min: 0, max: 1, step: 0.05 } }}
                  sx={{ flex: 0.8, minWidth: 0 }}
                />
                <IconButton
                  aria-label="Remove threshold"
                  onClick={() =>
                    onChange({
                      ...value,
                      thresholds: value.thresholds.filter((r) => r.key !== row.key),
                    })
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              </Stack>
              {(error || isBreached) && (
                <Stack direction="row" spacing={1} alignItems="center">
                  {isBreached && (
                    <Chip size="small" color="warning" label="Breached by the latest run" />
                  )}
                  {error && (
                    <Typography variant="caption" color="error">
                      {error}
                    </Typography>
                  )}
                </Stack>
              )}
            </Stack>
          );
        })}
        <Box>
          <Button
            size="small"
            startIcon={<Plus size={16} />}
            onClick={addRow}
            disabled={evaluators.length === 0 || value.thresholds.length >= MAX_THRESHOLDS}
          >
            Add threshold
          </Button>
        </Box>
      </Stack>

      {showErrors && errors.nothingSelected && (
        <Alert severity="warning">
          Choose at least one thing to be notified about, or stop watching.
        </Alert>
      )}
    </Stack>
  );
}
