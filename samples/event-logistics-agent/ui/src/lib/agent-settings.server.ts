import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type AgentSettings = {
  apiUrl: string;
  apiKey: string;
  apiHeader: string;
};

const ENV_FILE_PATH = join(process.cwd(), ".env");

const FALLBACK_SETTINGS: AgentSettings = {
  apiUrl: "/api/chat",
  apiKey: "",
  apiHeader: "Authorization",
};

export async function readAgentSettings(): Promise<AgentSettings> {
  const fileSettings = await readEnvFile();

  return {
    apiUrl: fileSettings.AGENT_URL ?? process.env.AGENT_URL ?? FALLBACK_SETTINGS.apiUrl,
    apiKey: fileSettings.AGENT_API_KEY ?? process.env.AGENT_API_KEY ?? FALLBACK_SETTINGS.apiKey,
    apiHeader:
      fileSettings.AGENT_API_HEADER ?? process.env.AGENT_API_HEADER ?? FALLBACK_SETTINGS.apiHeader,
  };
}

export async function writeAgentSettings(settings: AgentSettings): Promise<void> {
  const currentContents = await readExistingEnvFile();
  const nextContents = upsertEnvValues(currentContents, {
    AGENT_URL: settings.apiUrl,
    AGENT_API_KEY: settings.apiKey,
    AGENT_API_HEADER: settings.apiHeader,
  });

  await writeFile(ENV_FILE_PATH, nextContents, "utf8");
}

export async function clearAgentSettings(): Promise<void> {
  const currentContents = await readExistingEnvFile();
  const nextContents = removeEnvValues(currentContents, ["AGENT_URL", "AGENT_API_KEY", "AGENT_API_HEADER"]);

  await writeFile(ENV_FILE_PATH, nextContents, "utf8");
}

async function readEnvFile(): Promise<Record<string, string>> {
  const contents = await readExistingEnvFile();
  return parseEnvFile(contents);
}

async function readExistingEnvFile(): Promise<string> {
  try {
    return await readFile(ENV_FILE_PATH, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function parseEnvFile(contents: string): Record<string, string> {
  const settings: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    settings[key] = parseEnvValue(rawValue);
  }

  return settings;
}

function parseEnvValue(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return "";

  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];
  if (trimmed.length >= 2 && firstChar === lastChar && (firstChar === '"' || firstChar === "'")) {
    const inner = trimmed.slice(1, -1);
    if (firstChar === '"') {
      try {
        return JSON.parse(trimmed) as string;
      } catch {
        return inner;
      }
    }

    return inner.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  }

  return trimmed;
}

function upsertEnvValues(contents: string, values: Record<string, string>): string {
  const lines = normalizeLines(contents);
  const nextLines = lines.length === 0 ? [] : [...lines];
  const handled = new Set<string>();

  for (let index = 0; index < nextLines.length; index += 1) {
    for (const [key, value] of Object.entries(values)) {
      if (handled.has(key)) continue;
      if (matchesEnvKey(nextLines[index], key)) {
        nextLines[index] = `${key}=${formatEnvValue(value)}`;
        handled.add(key);
      }
    }
  }

  for (const [key, value] of Object.entries(values)) {
    if (!handled.has(key)) {
      nextLines.push(`${key}=${formatEnvValue(value)}`);
    }
  }

  return joinLines(nextLines);
}

function removeEnvValues(contents: string, keys: string[]): string {
  const lines = normalizeLines(contents);
  const filtered = lines.filter((line) => !keys.some((key) => matchesEnvKey(line, key)));
  return joinLines(filtered);
}

function normalizeLines(contents: string): string[] {
  if (!contents) return [];
  const lines = contents.split(/\r?\n/);
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

function joinLines(lines: string[]): string {
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

function matchesEnvKey(line: string, key: string): boolean {
  return new RegExp(`^\\s*(?:export\\s+)?${escapeRegExp(key)}\\s*=`).test(line);
}

function formatEnvValue(value: string): string {
  if (value === "") return '""';
  return JSON.stringify(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}