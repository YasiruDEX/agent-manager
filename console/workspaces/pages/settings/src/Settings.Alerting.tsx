/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Form,
  FormControlLabel,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { Copy, Plus, RefreshCcw, Send, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  useDeleteAlertEndpoint,
  useGetAlertEndpoint,
  useListAlertDeliveries,
  useTestAlertEndpoint,
  useUpsertAlertEndpoint,
} from "@agent-management-platform/api-client";
import type {
  AlertDeliveryStatus,
  AlertTestResponse,
} from "@agent-management-platform/types";

interface HeaderRow {
  name: string;
  value: string;
}

const STATUS_COLOR: Record<AlertDeliveryStatus, "success" | "warning" | "error"> = {
  sent: "success",
  pending: "warning",
  dead: "error",
};

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function relative(ts?: string): string {
  return ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : "—";
}

export const SettingsAlerting: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const params = { orgName: orgId };

  const { data: endpoint, isLoading } = useGetAlertEndpoint(params);
  const { data: deliveries, isLoading: deliveriesLoading, refetch } =
    useListAlertDeliveries(params, { limit: 25 });
  const { mutate: upsert, isPending: saving } = useUpsertAlertEndpoint();
  const { mutate: remove, isPending: deleting } = useDeleteAlertEndpoint();
  const { mutate: sendTest, isPending: testing } = useTestAlertEndpoint();

  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  // Header values are write-only: the API returns names only. Editing the
  // list replaces all stored headers, so it starts closed.
  const [editHeaders, setEditHeaders] = useState(false);
  const [headers, setHeaders] = useState<HeaderRow[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<AlertTestResponse | null>(null);

  useEffect(() => {
    if (endpoint) {
      setUrl(endpoint.url);
      setEnabled(endpoint.enabled);
    }
    setEditHeaders(!endpoint);
    setHeaders([]);
  }, [endpoint]);

  const setHeaderField = (index: number, patch: Partial<HeaderRow>) =>
    setHeaders((rows) => rows.map((r, j) => (j === index ? { ...r, ...patch } : r)));

  const urlError = submitted && !isValidUrl(url) ? "Enter an http(s) URL" : undefined;
  const headerError =
    submitted && editHeaders && headers.some((h) => !h.name.trim())
      ? "Header names cannot be empty"
      : undefined;

  const save = (regenerateSigningSecret = false) => {
    setSubmitted(true);
    if (!isValidUrl(url) || (editHeaders && headers.some((h) => !h.name.trim()))) return;
    upsert(
      {
        params,
        body: {
          url: url.trim(),
          enabled,
          regenerateSigningSecret,
          ...(editHeaders
            ? {
                headers: Object.fromEntries(
                  headers.map((h) => [h.name.trim(), h.value]),
                ),
              }
            : {}),
        },
      },
      {
        onSuccess: (res) => {
          if (res.signingSecret) setNewSecret(res.signingSecret);
          setSubmitted(false);
        },
      },
    );
  };

  const handleTest = () => {
    setTestResult(null);
    sendTest(params, {
      onSuccess: (res) => {
        setTestResult(res);
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={40} width={240} />
        <Skeleton variant="rounded" height={220} />
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h5">Alerting</Typography>
        <Typography variant="body2" color="text.secondary">
          Failure alerts for this organization are sent as signed HTTP POST requests
          to this endpoint. Choose what alerts are raised in each monitor&apos;s
          Alerting settings.
        </Typography>
      </Box>

      {newSecret && (
        <Alert
          severity="success"
          onClose={() => setNewSecret(null)}
          action={
            <IconButton
              size="small"
              aria-label="Copy signing secret"
              onClick={() => navigator.clipboard.writeText(newSecret)}
            >
              <Copy size={16} />
            </IconButton>
          }
        >
          <Typography variant="body2" fontWeight={600}>
            Signing secret — copy it now, it will not be shown again.
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
            {newSecret}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Verify the X-AMP-Signature header (t=&lt;unix&gt;,v1=HMAC-SHA256 of
            &quot;&lt;unix&gt;.&lt;body&gt;&quot;) with this secret.
          </Typography>
        </Alert>
      )}

      <Form.Stack>
        <Form.Section>
          <Form.Header>Endpoint</Form.Header>
          <Form.ElementWrapper name="url" label="URL">
            <TextField
              id="url"
              fullWidth
              placeholder="https://alerts.example.com/hooks/amp"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={!!urlError}
              helperText={urlError}
            />
          </Form.ElementWrapper>
          <FormControlLabel
            control={<Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />}
            label="Send alerts to this endpoint"
          />
        </Form.Section>

        <Form.Section>
          <Form.Header>Request headers</Form.Header>
          {!editHeaders ? (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {(endpoint?.headerNames ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No custom headers.
                </Typography>
              ) : (
                endpoint?.headerNames.map((name) => (
                  <Chip key={name} label={name} size="small" variant="outlined" />
                ))
              )}
              <Button size="small" onClick={() => setEditHeaders(true)}>
                Replace headers
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Add headers such as Authorization. Values are stored encrypted and
                never shown again{endpoint ? "; saving replaces all existing headers" : ""}.
              </Typography>
              {headers.map((h, i) => (
                <Box key={i} display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Header name"
                    value={h.name}
                    onChange={(e) => setHeaderField(i, { name: e.target.value })}
                  />
                  <TextField
                    size="small"
                    type="password"
                    placeholder="Value"
                    sx={{ flex: 1 }}
                    value={h.value}
                    onChange={(e) => setHeaderField(i, { value: e.target.value })}
                  />
                  <IconButton
                    size="small"
                    aria-label="Remove header"
                    onClick={() => setHeaders(headers.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              ))}
              {headerError && (
                <Typography variant="caption" color="error">
                  {headerError}
                </Typography>
              )}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={() => setHeaders([...headers, { name: "", value: "" }])}
                >
                  Add header
                </Button>
                {endpoint && (
                  <Button size="small" onClick={() => setEditHeaders(false)}>
                    Keep existing headers
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Form.Section>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={() => save(false)}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            {endpoint ? "Save" : "Create endpoint"}
          </Button>
          {endpoint && (
            <>
              <Button
                variant="outlined"
                startIcon={testing ? <CircularProgress size={16} /> : <Send size={16} />}
                onClick={handleTest}
                disabled={testing}
              >
                Send test alert
              </Button>
              <Button variant="outlined" onClick={() => save(true)} disabled={saving}>
                Regenerate signing secret
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => remove(params)}
                disabled={deleting}
              >
                Delete
              </Button>
            </>
          )}
        </Stack>

        {testResult && (
          <Alert severity={testResult.delivered ? "success" : "error"} onClose={() => setTestResult(null)}>
            {testResult.delivered
              ? `Test alert delivered (HTTP ${testResult.statusCode ?? "2xx"}).`
              : `Test alert failed${testResult.statusCode ? ` (HTTP ${testResult.statusCode})` : ""}: ${testResult.error ?? "unknown error"}`}
          </Alert>
        )}

        {endpoint && endpoint.consecutiveFailures > 0 && (
          <Alert severity="warning">
            The last {endpoint.consecutiveFailures} alert(s) could not be delivered. Last
            success {relative(endpoint.lastSuccessAt)}.
          </Alert>
        )}
      </Form.Stack>

      {endpoint && (
        <>
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Recent deliveries</Typography>
              <IconButton size="small" aria-label="Refresh deliveries" onClick={() => refetch()}>
                <RefreshCcw size={16} />
              </IconButton>
            </Stack>
            {deliveriesLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (deliveries?.deliveries ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No alerts have been sent yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Monitor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Attempts</TableCell>
                    <TableCell>Response</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries?.deliveries.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.eventType}</TableCell>
                      <TableCell>{d.monitorName ?? "—"}</TableCell>
                      <TableCell>
                        <Chip label={d.status} size="small" color={STATUS_COLOR[d.status]} />
                      </TableCell>
                      <TableCell>{d.attempts}</TableCell>
                      <TableCell title={d.lastError}>
                        {d.lastResponseCode ?? (d.lastError ? "error" : "—")}
                      </TableCell>
                      <TableCell>{relative(d.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
};

export default SettingsAlerting;
