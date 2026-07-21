import {
  isPlaceEvaluationPayload,
  type PlaceEvaluationPayload,
} from "./place-types";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type StageEvent = {
  node: string;
  status: "start" | "complete";
  label: string;
};

const SESSION_ID_STORAGE_KEY = "agent-sample-tester:session-id";

type SendOpts = {
  apiUrl: string;
  apiKey: string;
  apiHeader: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
};

type StreamOpts = SendOpts & {
  /** Called whenever a pipeline stage starts or completes. */
  onStage?: (stage: StageEvent) => void;
  /** Called with the full accumulated text so far, plus the newly-arrived delta. */
  onToken?: (accumulatedText: string, deltaText: string) => void;
  /** Called when the agent produced a full structured venue evaluation (a "card", not a chat reply). */
  onPlaceEvaluation?: (evaluation: PlaceEvaluationPayload) => void;
};

/**
 * Streams a chat response via SSE, reporting incremental progress through
 * onStage/onToken, and resolving with the final complete text.
 */
export async function streamChat({
  messages,
  signal,
  onStage,
  onToken,
  onPlaceEvaluation,
}: StreamOpts): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      session_id: getSessionId(),
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream") || !res.body) {
    if (contentType.includes("application/json")) {
      return extractText((await res.json()) as unknown);
    }
    return await res.text();
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamedText = "";
  let finalText: string | null = null;
  let errorMessage: string | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex: number;
    while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawFrame = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      const frame = parseSSEFrame(rawFrame);
      if (!frame) continue;

      if (frame.event === "token") {
        const delta = (frame.data as { text?: string }).text ?? "";
        streamedText += delta;
        onToken?.(streamedText, delta);
      } else if (frame.event === "stage") {
        onStage?.(frame.data as StageEvent);
      } else if (frame.event === "done") {
        finalText = (frame.data as { text?: string }).text ?? streamedText;
      } else if (frame.event === "place_evaluation") {
        if (isPlaceEvaluationPayload(frame.data)) {
          onPlaceEvaluation?.(frame.data);
        }
      } else if (frame.event === "error") {
        errorMessage =
          (frame.data as { message?: string }).message ?? "Agent error";
      }
    }
  }

  if (errorMessage) throw new Error(errorMessage);
  return finalText ?? streamedText;
}

/** Non-streaming variant, kept for callers that want a single buffered response. */
export async function sendChat({
  messages,
  signal,
}: SendOpts): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: getSessionId(),
      messages,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await res.json()) as unknown;
    return extractText(data);
  }
  return await res.text();
}

function parseSSEFrame(raw: string): { event: string; data: unknown } | null {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;

  try {
    return { event: eventName, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return null;
  }
}

function getSessionId() {
  if (typeof window === "undefined") return "session";

  try {
    const existing = window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) return existing;

    const next = crypto.randomUUID();
    window.localStorage.setItem(SESSION_ID_STORAGE_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  const obj = data as Record<string, unknown>;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.response === "string") return obj.response;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.result === "string") return obj.result;
  if (Array.isArray(obj.choices) && obj.choices.length > 0) {
    const first = obj.choices[0] as Record<string, unknown>;
    const msg = first.message as Record<string, unknown> | undefined;
    if (msg && typeof msg.content === "string") return msg.content;
    if (typeof first.text === "string") return first.text;
  }
  return JSON.stringify(data);
}
