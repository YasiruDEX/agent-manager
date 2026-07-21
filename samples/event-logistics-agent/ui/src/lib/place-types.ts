/**
 * Shared shapes for the structured venue risk-evaluation feature. Mirrors the
 * agent's report schema (see ../../../agent/prompts.py RISK_ANALYZER_SYSTEM_PROMPT)
 * and the "place_evaluation" payload emitted by app.py (both the JSON `/chat`
 * response and the SSE `place_evaluation` event carry this exact shape).
 */
export type PlaceReport = {
  venue_name?: string;
  overall_risk_level?: string;
  executive_summary?: string;
  weather_risk?: { summary?: string; points?: string[] };
  venue_logistics?: { summary?: string; points?: string[] };
  critical_failure_points?: string[];
  contingency_plan?: string[];
  weather_windows?: string[];
};

export type PlaceEvaluationPayload = {
  venue_address: string;
  event_date: string;
  resolved_lat?: number | null;
  resolved_lon?: number | null;
  maps_data?: Record<string, unknown>;
  weather_data?: Record<string, unknown>;
  report: PlaceReport;
};

export type PlaceStatus = "pending" | "ready" | "error";

/** A stored record in the Events tab — one per evaluated place. */
export type PlaceRecord = {
  id: string;
  venueAddress: string;
  eventDate: string;
  status: PlaceStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  resolvedLat?: number | null;
  resolvedLon?: number | null;
  mapsData?: Record<string, unknown>;
  weatherData?: Record<string, unknown>;
  report?: PlaceReport;
};

export function isPlaceEvaluationPayload(
  value: unknown,
): value is PlaceEvaluationPayload {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.venue_address === "string" &&
    typeof obj.event_date === "string" &&
    typeof obj.report === "object" &&
    obj.report !== null
  );
}
