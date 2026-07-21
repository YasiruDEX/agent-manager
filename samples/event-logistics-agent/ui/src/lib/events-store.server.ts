import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { PlaceEvaluationPayload, PlaceRecord } from "./place-types";

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "events.json");

async function readAll(): Promise<PlaceRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PlaceRecord[]) : [];
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

async function writeAll(records: PlaceRecord[]): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

export async function listPlaces(): Promise<PlaceRecord[]> {
  const records = await readAll();
  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPlace(id: string): Promise<PlaceRecord | null> {
  const records = await readAll();
  return records.find((r) => r.id === id) ?? null;
}

/** Creates a "pending" placeholder record, to be filled in once the agent responds. */
export async function createPendingPlace(
  venueAddress: string,
  eventDate: string,
): Promise<PlaceRecord> {
  const now = new Date().toISOString();
  const record: PlaceRecord = {
    id: crypto.randomUUID(),
    venueAddress,
    eventDate,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const records = await readAll();
  records.push(record);
  await writeAll(records);
  return record;
}

/** Stores an already-computed evaluation (e.g. one that streamed in via chat) as a new ready record. */
export async function createReadyPlace(
  evaluation: PlaceEvaluationPayload,
): Promise<PlaceRecord> {
  const now = new Date().toISOString();
  const record: PlaceRecord = {
    id: crypto.randomUUID(),
    venueAddress: evaluation.venue_address,
    eventDate: evaluation.event_date,
    status: "ready",
    createdAt: now,
    updatedAt: now,
    resolvedLat: evaluation.resolved_lat ?? null,
    resolvedLon: evaluation.resolved_lon ?? null,
    mapsData: evaluation.maps_data ?? {},
    weatherData: evaluation.weather_data ?? {},
    report: evaluation.report,
  };

  const records = await readAll();
  records.push(record);
  await writeAll(records);
  return record;
}

export async function markPlaceReady(
  id: string,
  evaluation: PlaceEvaluationPayload,
): Promise<PlaceRecord | null> {
  const records = await readAll();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: PlaceRecord = {
    ...records[index],
    status: "ready",
    updatedAt: new Date().toISOString(),
    resolvedLat: evaluation.resolved_lat ?? null,
    resolvedLon: evaluation.resolved_lon ?? null,
    mapsData: evaluation.maps_data ?? {},
    weatherData: evaluation.weather_data ?? {},
    report: evaluation.report,
    errorMessage: undefined,
  };
  records[index] = updated;
  await writeAll(records);
  return updated;
}

export async function markPlaceError(
  id: string,
  message: string,
): Promise<PlaceRecord | null> {
  const records = await readAll();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: PlaceRecord = {
    ...records[index],
    status: "error",
    errorMessage: message,
    updatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  await writeAll(records);
  return updated;
}

export async function deletePlace(id: string): Promise<boolean> {
  const records = await readAll();
  const next = records.filter((r) => r.id !== id);
  if (next.length === records.length) return false;
  await writeAll(next);
  return true;
}
