import { readAgentSettings } from "./agent-settings.server";
import {
  isPlaceEvaluationPayload,
  type PlaceEvaluationPayload,
} from "./place-types";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AgentCallResult =
  | { ok: true; text: string; placeEvaluation: PlaceEvaluationPayload | null }
  | { ok: false; status: number; message: string };

/** Calls the configured external agent once, non-streaming, and returns its text + any structured place evaluation. */
export async function callAgentOnce(
  messages: ChatMessage[],
  sessionId = "events-tab",
): Promise<AgentCallResult> {
  const { apiUrl, apiKey, apiHeader } = await readAgentSettings();

  if (!apiUrl || apiUrl === "/api/chat") {
    return {
      ok: false,
      status: 500,
      message: "No external agent URL configured. Set AGENT_URL in Settings.",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) {
    const headerName = (apiHeader || "Authorization").trim();
    headers[headerName] =
      headerName.toLowerCase() === "authorization"
        ? `Bearer ${apiKey}`
        : apiKey;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ session_id: sessionId, messages, stream: false }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, message: text || res.statusText };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = (await res.json()) as Record<string, unknown>;
      return {
        ok: true,
        text: extractText(data),
        placeEvaluation: isPlaceEvaluationPayload(data.place_evaluation)
          ? data.place_evaluation
          : null,
      };
    }

    return { ok: true, text: await res.text(), placeEvaluation: null };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      message: err instanceof Error ? err.message : "Unknown error",
    };
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
  return JSON.stringify(data);
}
