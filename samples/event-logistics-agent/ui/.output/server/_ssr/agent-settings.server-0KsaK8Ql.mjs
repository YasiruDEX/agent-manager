import processModule from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-settings.server-0KsaK8Ql.js
var ENV_FILE_PATH = join(processModule.cwd(), ".env");
var FALLBACK_SETTINGS = {
	apiUrl: "/api/chat",
	apiKey: "",
	apiHeader: "Authorization"
};
async function readAgentSettings() {
	const fileSettings = await readEnvFile();
	return {
		apiUrl: fileSettings.AGENT_URL ?? processModule.env.AGENT_URL ?? FALLBACK_SETTINGS.apiUrl,
		apiKey: fileSettings.AGENT_API_KEY ?? processModule.env.AGENT_API_KEY ?? FALLBACK_SETTINGS.apiKey,
		apiHeader: fileSettings.AGENT_API_HEADER ?? processModule.env.AGENT_API_HEADER ?? FALLBACK_SETTINGS.apiHeader
	};
}
async function writeAgentSettings(settings) {
	await writeFile(ENV_FILE_PATH, upsertEnvValues(await readExistingEnvFile(), {
		AGENT_URL: settings.apiUrl,
		AGENT_API_KEY: settings.apiKey,
		AGENT_API_HEADER: settings.apiHeader
	}), "utf8");
}
async function clearAgentSettings() {
	await writeFile(ENV_FILE_PATH, removeEnvValues(await readExistingEnvFile(), [
		"AGENT_URL",
		"AGENT_API_KEY",
		"AGENT_API_HEADER"
	]), "utf8");
}
async function readEnvFile() {
	return parseEnvFile(await readExistingEnvFile());
}
async function readExistingEnvFile() {
	try {
		return await readFile(ENV_FILE_PATH, "utf8");
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return "";
		throw error;
	}
}
function parseEnvFile(contents) {
	const settings = {};
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
function parseEnvValue(rawValue) {
	const trimmed = rawValue.trim();
	if (!trimmed) return "";
	const firstChar = trimmed[0];
	const lastChar = trimmed[trimmed.length - 1];
	if (trimmed.length >= 2 && firstChar === lastChar && (firstChar === "\"" || firstChar === "'")) {
		const inner = trimmed.slice(1, -1);
		if (firstChar === "\"") try {
			return JSON.parse(trimmed);
		} catch {
			return inner;
		}
		return inner.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
	}
	return trimmed;
}
function upsertEnvValues(contents, values) {
	const lines = normalizeLines(contents);
	const nextLines = lines.length === 0 ? [] : [...lines];
	const handled = /* @__PURE__ */ new Set();
	for (let index = 0; index < nextLines.length; index += 1) for (const [key, value] of Object.entries(values)) {
		if (handled.has(key)) continue;
		if (matchesEnvKey(nextLines[index], key)) {
			nextLines[index] = `${key}=${formatEnvValue(value)}`;
			handled.add(key);
		}
	}
	for (const [key, value] of Object.entries(values)) if (!handled.has(key)) nextLines.push(`${key}=${formatEnvValue(value)}`);
	return joinLines(nextLines);
}
function removeEnvValues(contents, keys) {
	return joinLines(normalizeLines(contents).filter((line) => !keys.some((key) => matchesEnvKey(line, key))));
}
function normalizeLines(contents) {
	if (!contents) return [];
	const lines = contents.split(/\r?\n/);
	while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
	return lines;
}
function joinLines(lines) {
	return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}
function matchesEnvKey(line, key) {
	return new RegExp(`^\\s*(?:export\\s+)?${escapeRegExp(key)}\\s*=`).test(line);
}
function formatEnvValue(value) {
	if (value === "") return "\"\"";
	return JSON.stringify(value);
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
export { readAgentSettings as n, writeAgentSettings as r, clearAgentSettings as t };
