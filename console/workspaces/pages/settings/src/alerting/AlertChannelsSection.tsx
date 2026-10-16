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

import { useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { ArrowLeft, Copy, KeyRound, Plus, Trash2 } from "@wso2/oxygen-ui-icons-react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useResolvedPath,
} from "react-router-dom";
import { PageLayout } from "@agent-management-platform/views";
import {
  useConfirmationDialog,
  usePipelineEnvironments,
  useUnsavedChangesGuard,
} from "@agent-management-platform/shared-component";
import {
  useCreateAlertChannel,
  useDeleteAlertChannel,
  useAlertChannelKinds,
  useAlertEventTypes,
  useAlertingEnabled,
  useListAlertChannels,
  useRotateAlertChannelSecret,
  useTestAlertChannel,
  useUpdateAlertChannel,
} from "@agent-management-platform/api-client";
import type {
  AlertChannelResponse,
  AlertTargetParams,
  AlertChannelTestResponse,
} from "@agent-management-platform/types";
import { AlertChannelForm, type EnvironmentOption } from "./AlertChannelForm";
import { AlertChannelsTable } from "./AlertChannelsTable";
import { AlertDeliveriesDrawer } from "./AlertDeliveriesDrawer";

export interface AlertChannelsSectionProps {
  target: AlertTargetParams;
  canManage: boolean;
  title: string;
  description: string;
  /**
   * "page" renders in its own PageLayout, like the monitors pages; "embedded"
   * renders inside an existing layout (org settings).
   */
  layout: "page" | "embedded";
  /** For agent channels: the environment preselected for a new channel. */
  currentEnvironment?: string;
  /** Where the Add Channel button goes: the page header or the table toolbar. */
  addButtonPlacement?: "header" | "toolbar";
}

/** Shown once, right after a secret is generated. */
interface RevealedSecret {
  channelName: string;
  secret: string;
}

/**
 * Alert channels of one scope: the list, and full-page create and edit forms at
 * "new" and ":channelId/edit" below the current route. Mount it on a "/*"
 * route.
 */
export function AlertChannelsSection(props: AlertChannelsSectionProps) {
  const { target } = props;
  const listPath = useResolvedPath(".").pathname;
  const alertingEnabled = useAlertingEnabled();
  const { data, isLoading, error } = useListAlertChannels(target, alertingEnabled);
  const isAgent = target.scope === "agent";
  const pipelineEnvs = usePipelineEnvironments(
    isAgent ? target.orgName : undefined,
    isAgent ? target.projName : undefined,
  );
  const environmentOptions = useMemo<EnvironmentOption[] | undefined>(
    () =>
      isAgent
        ? pipelineEnvs.map((e) => ({ name: e.name, label: e.displayName ?? e.name }))
        : undefined,
    [isAgent, pipelineEnvs],
  );
  const shared = {
    ...props,
    listPath,
    channels: data?.channels ?? [],
    isLoading,
    error,
    environmentOptions,
  };

  // Reached by a direct link while the deployment runs no event bus.
  if (!alertingEnabled) {
    return (
      <Chrome layout={props.layout} title={props.title} description={props.description}>
        <Alert severity="info">
          Alerting is not enabled on this deployment. An administrator can turn it
          on by running Agent Manager with an event bus.
        </Alert>
      </Chrome>
    );
  }

  return (
    <Routes>
      <Route index element={<AlertChannelsList {...shared} />} />
      <Route path="new" element={<AlertChannelEditor {...shared} />} />
      <Route path=":channelId/edit" element={<AlertChannelEditor {...shared} />} />
    </Routes>
  );
}

interface SharedProps extends AlertChannelsSectionProps {
  listPath: string;
  channels: AlertChannelResponse[];
  isLoading: boolean;
  error: unknown;
  environmentOptions?: EnvironmentOption[];
}

function Chrome({
  layout,
  title,
  description,
  actions,
  backHref,
  children,
}: {
  layout: "page" | "embedded";
  title?: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  if (layout === "page") {
    return (
      <PageLayout
        title={title ?? ""}
        description={description}
        disableIcon
        actions={actions}
        backHref={backHref}
        backLabel={backHref ? "Back to Alerting" : undefined}
      >
        {children}
      </PageLayout>
    );
  }
  return (
    <Stack spacing={3}>
      {backHref && (
        <Box>
          <Button
            variant="text"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(backHref)}
          >
            Back to Alerting
          </Button>
        </Box>
      )}
      {title && (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5">{title}</Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
      )}
      {children}
    </Stack>
  );
}

function AlertChannelsList({
  target,
  canManage,
  title,
  layout,
  addButtonPlacement = "toolbar",
  channels,
  isLoading,
  error,
  environmentOptions,
}: SharedProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: remove } = useDeleteAlertChannel(target);
  const { mutate: update, isPending: toggling, variables: toggled } = useUpdateAlertChannel(target);
  const { data: catalog } = useAlertEventTypes(target.orgName, target.scope);
  // Sends the channel back as it is with only enabled changed. A notification
  // service URL is left out, which keeps the stored one. Types this scope no
  // longer offers are dropped, as the form does, so an older channel saves.
  const handleToggleEnabled = (w: AlertChannelResponse, enabled: boolean) =>
    update({
      id: w.id,
      body: {
        name: w.name,
        description: w.description,
        kind: w.kind,
        config: w.config,
        environments: target.scope === "agent" ? w.environments : undefined,
        eventTypes: catalog
          ? w.eventTypes.filter((t) => catalog.eventTypes.some((c) => c.type === t))
          : w.eventTypes,
        enabled,
      },
    });
  const { mutate: rotate } = useRotateAlertChannelSecret(target);
  const {
    mutate: sendTest,
    isPending: testing,
    variables: testingId,
  } = useTestAlertChannel(target);
  const { addConfirmation } = useConfirmationDialog();
  const { data: kindList } = useAlertChannelKinds(target.orgName);
  const kindInfo = (c: AlertChannelResponse) => kindList?.kinds.find((k) => k.kind === c.kind);
  const [viewing, setViewing] = useState<AlertChannelResponse | undefined>();
  const [rotated, setRotated] = useState<RevealedSecret | null>(null);
  const [testResult, setTestResult] = useState<
    { name: string; result: AlertChannelTestResponse } | null
  >(null);

  // A secret created on the form page arrives in the navigation state.
  const created = (location.state as { created?: RevealedSecret } | null)?.created ?? null;
  const secret = rotated ?? created;
  const dismissSecret = () => {
    setRotated(null);
    if (created) navigate(".", { replace: true, state: null });
  };

  const envLabel = (name: string) =>
    environmentOptions?.find((e) => e.name === name)?.label ?? name;

  const handleDelete = (w: AlertChannelResponse) =>
    addConfirmation({
      analytics: { entity: "alert-channel", action: "delete" },
      title: "Delete Channel",
      description: `"${w.name}" will stop receiving events. Events already queued for it are dropped.`,
      confirmButtonText: "Delete",
      confirmButtonColor: "error",
      confirmButtonIcon: <Trash2 size={16} />,
      onConfirm: () => remove(w.id),
    });

  const handleRotate = (w: AlertChannelResponse) =>
    addConfirmation({
      analytics: { entity: "alert-channel", action: "rotate-secret" },
      title: "Rotate Signing Secret",
      description:
        "A new secret is generated and the current one stops working immediately. " +
        "Update the receiver before the next event is sent.",
      confirmButtonText: "Rotate",
      confirmButtonIcon: <KeyRound size={16} />,
      onConfirm: () =>
        rotate(w.id, {
          onSuccess: (res) => setRotated({ channelName: w.name, secret: res.secret }),
        }),
    });

  const addButton = (
    <Button
      variant="contained"
      startIcon={<Plus />}
      disabled={!canManage}
      onClick={() => navigate("new")}
      sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
    >
      Add Channel
    </Button>
  );

  const handleTest = (w: AlertChannelResponse) => {
    setTestResult(null);
    sendTest(w.id, { onSuccess: (result) => setTestResult({ name: w.name, result }) });
  };

  return (
    <Chrome
      layout={layout}
      title={layout === "page" ? title : undefined}
      actions={addButtonPlacement === "header" ? addButton : undefined}
    >
      <Stack spacing={3}>
        {secret && (
          <Alert
            severity="success"
            onClose={dismissSecret}
            action={
              <IconButton
                size="small"
                aria-label="Copy signing secret"
                onClick={() => navigator.clipboard.writeText(secret.secret)}
              >
                <Copy size={16} />
              </IconButton>
            }
          >
            <Typography variant="body2" fontWeight={600}>
              Signing secret for {secret.channelName}. Copy it now; it is not shown again.
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
              {secret.secret}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Requests carry Standard Webhooks headers: verify webhook-signature
              (HMAC-SHA256 of &quot;id.timestamp.body&quot;) with this secret.
            </Typography>
          </Alert>
        )}
        {testResult && (
          <Alert
            severity={testResult.result.delivered ? "success" : "error"}
            onClose={() => setTestResult(null)}
          >
            {testResult.result.delivered
              ? `Test event delivered to ${testResult.name}` +
                (testResult.result.statusCode ? ` (HTTP ${testResult.result.statusCode}).` : ".")
              : `Test event to ${testResult.name} failed: ${testResult.result.error ?? "unknown error"}`}
          </Alert>
        )}
        {!canManage && (
          <Alert severity="info">You can view these channels but not change them.</Alert>
        )}
        <AlertChannelsTable
          channels={channels}
          isLoading={isLoading}
          error={error}
          canManage={canManage}
          showEnvironments={target.scope === "agent"}
          envLabel={envLabel}
          testingId={testing ? testingId : undefined}
          toolbarActions={addButtonPlacement === "toolbar" ? addButton : undefined}
          onEdit={(w) => navigate(`${w.id}/edit`)}
          onTest={handleTest}
          onDeliveries={setViewing}
          onRotate={handleRotate}
          // Until the kinds load, a webhook is the kind known to have a secret.
          canRotate={(c) => kindInfo(c)?.generatedSecret ?? c.kind === "webhook"}
          destinationOf={(c) =>
            c.kind === "notify"
              ? (kindInfo(c)?.services.find((s) => s.id === c.config?.service)?.label ??
                c.config?.service ??
                "")
              : (c.config?.url ?? "")
          }
          onDelete={handleDelete}
          onToggleEnabled={handleToggleEnabled}
          togglingId={toggling ? toggled?.id : undefined}
        />
      </Stack>
      <AlertDeliveriesDrawer
        target={target}
        channel={viewing}
        onClose={() => setViewing(undefined)}
      />
    </Chrome>
  );
}

function AlertChannelEditor({
  target,
  layout,
  listPath,
  channels,
  isLoading,
  environmentOptions,
  currentEnvironment,
}: SharedProps) {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const { mutate: create, isPending: creating } = useCreateAlertChannel(target);
  const { mutate: update, isPending: updating } = useUpdateAlertChannel(target);
  const editing = channelId ? channels.find((w) => w.id === channelId) : undefined;
  const defaultEnvironments = useMemo(
    () => (currentEnvironment ? [currentEnvironment] : []),
    [currentEnvironment],
  );
  const [dirty, setDirty] = useState(false);
  // Asks before leaving with unsaved changes; a successful save leaves freely.
  const { allowNavigation } = useUnsavedChangesGuard(dirty);
  const backToList = (state?: unknown) => navigate(listPath, { state });
  const leaveSaved = (state?: unknown) => allowNavigation(() => backToList(state));

  const title = channelId ? "Edit Channel" : "Add Channel";
  const description = channelId
    ? "Change where this channel posts and which events it receives."
    : "Choose where events are sent and which events to send.";

  if (channelId && !editing) {
    return (
      <Chrome layout={layout} title={title} backHref={listPath}>
        {isLoading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <Alert severity="error">This channel no longer exists.</Alert>
        )}
      </Chrome>
    );
  }

  return (
    <Chrome layout={layout} title={title} description={description} backHref={listPath}>
      <AlertChannelForm
        orgName={target.orgName}
        scope={target.scope}
        channel={editing}
        environmentOptions={environmentOptions}
        defaultEnvironments={defaultEnvironments}
        saving={creating || updating}
        submitLabel={channelId ? "Save" : "Add Channel"}
        onCancel={() => backToList()}
        onDirtyChange={setDirty}
        onSubmit={(body) => {
          if (editing) {
            update({ id: editing.id, body }, { onSuccess: () => leaveSaved() });
            return;
          }
          create(body, {
            onSuccess: (res) =>
              leaveSaved(
                res.secret
                  ? { created: { channelName: res.name, secret: res.secret } }
                  : undefined,
              ),
          });
        }}
      />
    </Chrome>
  );
}

export default AlertChannelsSection;
