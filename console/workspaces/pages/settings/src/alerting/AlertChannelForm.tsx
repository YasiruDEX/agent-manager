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
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  CardHeader,
  Chip,
  Form,
  ListSubheader,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { Check, CircleIcon } from "@wso2/oxygen-ui-icons-react";
import {
  useAlertChannelKinds,
  useAlertEventTypes,
} from "@agent-management-platform/api-client";
import type {
  AlertChannelKindService,
  AlertEventType,
  AlertChannelKind,
  AlertChannelRequest,
  AlertChannelResponse,
  AlertScope,
} from "@agent-management-platform/types";

/**
 * Channel kinds the form offers, if the service supports them. A new kind
 * adds an entry here, a branch for its settings below, and a driver in the
 * service. The services a "notify" channel can use come from the service, so
 * a new one needs no change here.
 */
const CHANNEL_KINDS: { kind: AlertChannelKind; label: string; description: string }[] = [
  {
    kind: "webhook",
    label: "Webhook",
    description: "Signed HTTPS POST of each event (Standard Webhooks)",
  },
  {
    kind: "notify",
    label: "Notification service",
    description: "A text message to Slack, Teams, email, PagerDuty and more",
  },
];

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export interface EnvironmentOption {
  name: string;
  label: string;
}

export interface AlertChannelFormProps {
  orgName?: string;
  scope: AlertScope;
  /** The channel being edited; undefined to create one. */
  channel?: AlertChannelResponse;
  /** Environments an agent channel selects from; undefined for other scopes. */
  environmentOptions?: EnvironmentOption[];
  /** Environments preselected for a new agent channel. */
  defaultEnvironments?: string[];
  saving: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (body: AlertChannelRequest) => void;
  /** Called when the form starts or stops differing from what was loaded. */
  onDirtyChange?: (dirty: boolean) => void;
}

/** Selection marker used on every selectable card, as on the evaluator cards. */
function SelectionAvatar({ selected }: { selected: boolean }) {
  return (
    <Avatar
      sx={{
        bgcolor: selected ? "primary.main" : "default",
        color: selected ? "primary.contrastText" : "text.secondary",
        width: 32,
        height: 32,
        flexShrink: 0,
      }}
    >
      {selected ? <Check size={16} /> : <CircleIcon size={16} />}
    </Avatar>
  );
}

const cardGrid = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(auto-fill, minmax(260px, 1fr))",
    md: "repeat(auto-fill, minmax(300px, 1fr))",
  },
  gap: 2,
} as const;

/** Create or edit a channel, laid out like the monitor creation form. */
export function AlertChannelForm({
  orgName,
  scope,
  channel,
  environmentOptions,
  defaultEnvironments,
  saving,
  submitLabel,
  onCancel,
  onSubmit,
  onDirtyChange,
}: AlertChannelFormProps) {
  const { data: catalog, isLoading } = useAlertEventTypes(orgName, scope);
  const { data: kindList } = useAlertChannelKinds(orgName);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<AlertChannelKind>("webhook");
  const [service, setService] = useState("");
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [envs, setEnvs] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const isAgent = !!environmentOptions;

  useEffect(() => {
    setName(channel?.name ?? "");
    setDescription(channel?.description ?? "");
    setKind(channel?.kind ?? "webhook");
    setService(channel?.config?.service ?? "");
    // A notification service URL is a credential and never comes back: it
    // starts empty, and stays as it is unless a new one is entered.
    setUrl(channel?.kind === "notify" ? "" : (channel?.config?.url ?? ""));
    setSelected(new Set(channel?.eventTypes ?? []));
    setEnvs(new Set(channel?.environments ?? defaultEnvironments ?? []));
    setSubmitted(false);
  }, [channel, defaultEnvironments]);

  const sameSet = (a: Set<string>, b: string[]) =>
    a.size === new Set(b).size && b.every((v) => a.has(v));
  const isDirty =
    name !== (channel?.name ?? "") ||
    description !== (channel?.description ?? "") ||
    kind !== (channel?.kind ?? "webhook") ||
    service !== (channel?.config?.service ?? "") ||
    url !== (channel?.kind === "notify" ? "" : (channel?.config?.url ?? "")) ||
    !sameSet(selected, channel?.eventTypes ?? []) ||
    (isAgent && !sameSet(envs, channel?.environments ?? defaultEnvironments ?? []));

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, AlertEventType[]>();
    for (const t of catalog?.eventTypes ?? []) {
      byCategory.set(t.category, [...(byCategory.get(t.category) ?? []), t]);
    }
    return [...byCategory.entries()];
  }, [catalog]);

  const offered = useMemo(
    () => new Set((catalog?.eventTypes ?? []).map((t) => t.type)),
    [catalog],
  );

  const toggleSet = (setter: typeof setSelected, values: string[], on: boolean) =>
    setter((current) => {
      const next = new Set(current);
      values.forEach((v) => (on ? next.add(v) : next.delete(v)));
      return next;
    });

  const kindInfo = kindList?.kinds.find((k) => k.kind === kind);
  // Offer the kinds the service supports; all of them until it has answered.
  const kindOptions = kindList
    ? CHANNEL_KINDS.filter((k) => kindList.kinds.some((info) => info.kind === k.kind))
    : CHANNEL_KINDS;
  const services = useMemo(() => kindInfo?.services ?? [], [kindInfo]);
  const selectedService = services.find((s) => s.id === service);
  const serviceGroups = useMemo(() => {
    const byCategory = new Map<string, AlertChannelKindService[]>();
    for (const s of services) {
      byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
    }
    return [...byCategory.entries()];
  }, [services]);

  const isNotify = kind === "notify";
  // Editing a notification channel keeps its URL unless a new one is
  // entered; a new channel, or another service, needs one.
  const keepsUrl = isNotify && !!channel && service === (channel.config?.service ?? "");
  const urlProblem = (): string | undefined => {
    const v = url.trim();
    if (!isNotify) return isValidUrl(v) ? undefined : "Enter an http(s) URL";
    if (!v) return keepsUrl ? undefined : "Enter the service URL";
    const scheme = v.split("://")[0]?.split("+")[0];
    return scheme === service ? undefined : `A ${selectedService?.label ?? service} URL starts with ${service}://`;
  };

  const nameError = submitted && !name.trim() ? "Enter a name" : undefined;
  const serviceError = submitted && isNotify && !service ? "Choose a service" : undefined;
  const urlError = submitted && (!isNotify || !!service) ? urlProblem() : undefined;
  const envError =
    submitted && isAgent && envs.size === 0 ? "Select at least one environment" : undefined;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!name.trim() || (isNotify && !service) || urlProblem()) return;
    if (isAgent && envs.size === 0) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      kind,
      config: isNotify
        ? { service, ...(url.trim() ? { url: url.trim() } : {}) }
        : { url: url.trim() },
      environments: isAgent ? [...envs] : undefined,
      // Enabled is switched from the channels list; a new channel starts on.
      enabled: channel?.enabled ?? true,
      // Keep only types this scope still offers, so a channel saved before an
      // event moved to another scope can be edited without an error.
      eventTypes: [...selected].filter((t) => offered.has(t)),
    });
  };

  return (
    <Stack spacing={3}>
      <Form.Stack>
        <Form.Section>
          <Form.Header>Channel Details</Form.Header>
          <Form.ElementWrapper name="name" label="Name">
            <TextField
              id="name"
              required
              fullWidth
              placeholder="Enter channel name"
              slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH } }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError ?? "Visible label shown in the channels list"}
            />
          </Form.ElementWrapper>
          <Form.ElementWrapper name="description" label="Description">
            <TextField
              id="description"
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter channel description"
              slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX_LENGTH } }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.ElementWrapper>
        </Form.Section>

        <Form.Section>
          <Form.Header>Channel</Form.Header>
          <Typography variant="caption" color="text.secondary">
            {channel
              ? "The channel type cannot be changed."
              : "Choose how events are delivered."}
          </Typography>
          <Box sx={cardGrid}>
            {kindOptions.map((k) => {
              const isSelected = kind === k.kind;
              return (
                <Form.CardButton
                  key={k.kind}
                  selected={isSelected}
                  disabled={!!channel && !isSelected}
                  sx={{ width: "100%", minWidth: 0, justifyContent: "flex-start" }}
                  onClick={() => {
                    if (channel || k.kind === kind) return;
                    setKind(k.kind);
                    setUrl("");
                    setService("");
                  }}
                >
                  <CardHeader
                    title={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <SelectionAvatar selected={isSelected} />
                        <Typography variant="h6">{k.label}</Typography>
                      </Stack>
                    }
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Typography variant="caption">{k.description}</Typography>
                  </CardContent>
                </Form.CardButton>
              );
            })}
          </Box>
          {isNotify ? (
            <>
              <Form.ElementWrapper name="service" label="Service">
                <TextField
                  id="service"
                  select
                  required
                  fullWidth
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  error={!!serviceError}
                  helperText={serviceError ?? "Where the notification is sent"}
                  slotProps={{
                    select: {
                      displayEmpty: true,
                      renderValue: (value) =>
                        value ? (
                          (services.find((s) => s.id === value)?.label ?? String(value))
                        ) : (
                          <Typography component="span" color="text.secondary">
                            Choose a service
                          </Typography>
                        ),
                      MenuProps: {
                        slotProps: {
                          paper: { sx: { maxHeight: 360 } },
                          list: { sx: { py: 0.5 } },
                        },
                      },
                    },
                  }}
                >
                  {serviceGroups.flatMap(([category, items], i) => [
                    <ListSubheader
                      key={`h-${category}`}
                      sx={{
                        lineHeight: "32px",
                        bgcolor: "background.paper",
                        ...(i > 0 && { borderTop: 1, borderColor: "divider", mt: 0.5 }),
                      }}
                    >
                      <Typography variant="overline" color="text.secondary">
                        {category}
                      </Typography>
                    </ListSubheader>,
                    ...items.map((s) => (
                      <MenuItem key={s.id} value={s.id} sx={{ pl: 3 }}>
                        {s.label}
                      </MenuItem>
                    )),
                  ])}
                </TextField>
              </Form.ElementWrapper>
              {selectedService && (
                <Form.ElementWrapper name="url" label="Service URL">
                  <TextField
                    id="url"
                    required={!keepsUrl}
                    fullWidth
                    autoComplete="off"
                    placeholder={
                      keepsUrl ? "Leave blank to keep the current URL" : selectedService.urlFormat
                    }
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    error={!!urlError}
                    helperText={
                      urlError ?? (
                        <>
                          {`Format: ${selectedService.urlFormat}. The URL holds the service's token, so it is stored encrypted and not shown again. `}
                          <Typography
                            component="a"
                            variant="caption"
                            href={selectedService.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: "primary.main" }}
                          >
                            How to get these values
                          </Typography>
                        </>
                      )
                    }
                  />
                </Form.ElementWrapper>
              )}
            </>
          ) : (
            <Form.ElementWrapper name="url" label="Endpoint URL">
              <TextField
                id="url"
                required
                fullWidth
                placeholder="https://hooks.example.com/amp"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                error={!!urlError}
                helperText={
                  urlError ?? "Events are sent here as signed JSON POST requests"
                }
              />
            </Form.ElementWrapper>
          )}
        </Form.Section>

        {isAgent && (
          <Form.Section>
            <Form.Header>Environments</Form.Header>
            <Typography variant="caption" color="text.secondary">
              Events in the selected environments are sent to this channel.
              Agent events that are not tied to an environment, such as builds,
              are always sent.
            </Typography>
            <Box sx={cardGrid}>
              {environmentOptions.map((env) => {
                const isSelected = envs.has(env.name);
                return (
                  <Form.CardButton
                    key={env.name}
                    selected={isSelected}
                    sx={{ width: "100%", minWidth: 0, justifyContent: "flex-start" }}
                    onClick={() => toggleSet(setEnvs, [env.name], !isSelected)}
                  >
                    <CardHeader
                      title={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <SelectionAvatar selected={isSelected} />
                          <Typography variant="h6">{env.label}</Typography>
                        </Stack>
                      }
                    />
                  </Form.CardButton>
                );
              })}
            </Box>
            {envError && (
              <Typography variant="caption" color="error">
                {envError}
              </Typography>
            )}
          </Form.Section>
        )}

        <Form.Section>
          <Form.Header>Events</Form.Header>
          <Typography variant="caption" color="text.secondary">
            Choose the events to send. Nothing is sent until you select at least one.
          </Typography>
          {isLoading ? (
            <Box sx={cardGrid}>
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
            </Box>
          ) : (
            <Stack spacing={3}>
              {groups.map(([category, types]) => {
                const names = types.map((t) => t.type);
                const count = names.filter((n) => selected.has(n)).length;
                const all = count === names.length;
                return (
                  <Stack key={category} spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${count}/${names.length}`}
                        color={count > 0 ? "primary" : "default"}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => toggleSet(setSelected, names, !all)}
                      >
                        {all ? "Clear" : "Select all"}
                      </Button>
                    </Stack>
                    <Box sx={cardGrid}>
                      {types.map((t) => {
                        const isSelected = selected.has(t.type);
                        return (
                          <Form.CardButton
                            key={t.type}
                            selected={isSelected}
                            sx={{
                              width: "100%",
                              minWidth: 0,
                              justifyContent: "flex-start",
                              overflow: "hidden",
                            }}
                            onClick={() => toggleSet(setSelected, [t.type], !isSelected)}
                          >
                            <CardHeader
                              sx={{
                                width: "100%",
                                minWidth: 0,
                                "& .MuiCardHeader-content": { overflow: "hidden", minWidth: 0 },
                              }}
                              title={
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <SelectionAvatar selected={isSelected} />
                                  <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    noWrap
                                    sx={{ fontFamily: "monospace", minWidth: 0 }}
                                  >
                                    {t.type}
                                  </Typography>
                                </Stack>
                              }
                            />
                            <CardContent sx={{ pt: 0 }}>
                              <Typography variant="caption">{t.description}</Typography>
                            </CardContent>
                          </Form.CardButton>
                        );
                      })}
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Form.Section>
      </Form.Stack>

      {submitted && selected.size === 0 && (
        <Alert severity="info">
          No events are selected, so this channel will not receive anything yet.
        </Alert>
      )}

      <Stack direction="row" gap={2}>
        <Button variant="outlined" color="primary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

export default AlertChannelForm;
