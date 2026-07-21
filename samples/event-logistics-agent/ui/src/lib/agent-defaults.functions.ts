import { createServerFn } from "@tanstack/react-start";
import { readAgentSettings } from "./agent-settings.server";

export const getAgentDefaults = createServerFn({ method: "GET" }).handler(async () => {
  return await readAgentSettings();
});
