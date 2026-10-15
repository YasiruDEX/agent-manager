# Platform events and alerting

Agent Manager publishes a platform event when something happens — a project is created, an agent is deployed, a monitor run finishes — and delivers it to the **alert channels** that orgs, projects and agents configure. This document covers how that works and how to run it.

## How it works

```
API (2xx) ─► events middleware ─► Publisher ─► events.Bus ─► AMP_EVENTS
Monitor scheduler ───────────────────┘                          │
                                                                ▼
                      alert dispatcher (inside the service, every replica)
                        fan-out: match channels, record "pending",
                                 one job per channel ─► AMP_ALERT_DELIVERIES
                        delivery: channel driver sends, retries, records result
                                                                │
                                                                ▼
                                                 webhook (today) · more kinds later
```

- **Events** are CloudEvents 1.0 (`type` = `com.wso2.agentmanager.<name>`), with extension attributes `orgid`, `scope`, `project`, `agent`, `environment`, `actortype` and `actorid`. The catalog in `events/catalog.go` maps API routes to event types and scopes. Route events fire when a request succeeds.
- **The event bus** sits behind the `events.Bus` interface. NATS JetStream is the implementation shipped, as a server (`nats`) or embedded in the process (`embedded`).
- **Alert channels** have a scope (org, project, or agent with selected environments), the event types they subscribe to, and a **kind** that decides how events are delivered. Each kind has a driver behind `alertchannels.Driver`; `webhook` is the only one today. It POSTs the CloudEvent signed per [Standard Webhooks](https://www.standardwebhooks.com) (`webhook-id`, `webhook-timestamp`, `webhook-signature`), refusing private addresses.
- **The dispatcher** is a module of the service, not a separate deployment. Every replica runs it on shared durable consumers (`alert-fanout`, `alert-delivery`), so each message is handled by one replica.

## Delivery guarantees

- **At least once.** A receiver may see an event twice after a crash or a lost acknowledgement; it should drop duplicates by `webhook-id`, which is the same on every attempt.
- **Retries** follow the driver: a webhook retries network errors, 408, 425, 429 and 5xx after 10s, 1m, 5m, 30m and 2h, up to `ALERTING_MAX_ATTEMPTS`. Other responses fail at once.
- **A delivery already recorded as delivered is not sent again** when its job comes back.
- **With `embedded`**, the bus is in memory: events and pending retries waiting at a restart are lost. Use `nats` for anything but quick start.
- **History** is kept for `ALERTING_DELIVERY_RETENTION_DAYS` in `alert_deliveries`. Event bodies are not stored there; the event lives on the bus (72 hours on `AMP_EVENTS`).

## Configuration

| Setting | Default | Purpose |
|---|---|---|
| `EVENTS_MODE` | `off` (the chart sets `nats`) | `nats`, `embedded` or `off`. `off` runs no bus and the console hides alerting. |
| `EVENTS_NATS_URL` | – | NATS server for `nats` mode |
| `ALERTING_MAX_ATTEMPTS` | `6` | Attempts before a delivery is marked failed |
| `ALERTING_DELIVERY_RETENTION_DAYS` | `14` | Delivery history retention |
| `ALERTING_ALLOW_PRIVATE_ENDPOINTS` | `false` | Allow private or plain-http channel URLs. Local development only. |

`embedded` supports a single replica; several replicas need `nats`. The console learns whether alerting is on from `GET /api/v1/config` (`alertingEnabled`).

### Helm

`agentManagerService.config.events.mode` is the only switch. With `nats` and no `events.natsUrl`, the chart deploys a NATS StatefulSet (`amp-nats`, JetStream on a 2Gi volume); with `natsUrl` set it uses that server instead. `embedded` and `off` deploy no NATS. The quick-start installer uses `embedded`.

### docker-compose

`make setup` runs a NATS container and sets `EVENTS_MODE=nats`, with private endpoints allowed so a receiver on your machine can be used.

## Permissions

| Scope | View | Change |
|---|---|---|
| Org | `amp:alerting:read` | `amp:alerting:manage` |
| Project | project read | project update |
| Agent | agent read | agent update |

Read-only callers see channel destinations masked. Every channel change is written to the audit trail (`alert-channel:*` actions), and channels are removed with their project or agent.

## Adding a channel kind

1. Implement `alertchannels.Driver` in `services/alertchannels/<kind>/`: validate and normalise the settings, mask them for read-only callers, generate a secret if the kind has one, deliver, and say which failures are retryable.
2. Register it in `ProvideAlertChannelDrivers` (`wiring/wire.go`) and add the kind to the API enum.
3. Add the kind and its settings fields to the console form (`CHANNEL_KINDS` in `AlertChannelForm.tsx`).

Matching, queuing, retries, the delivery log and the API stay as they are.
