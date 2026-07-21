import { clearAgentSettings, readAgentSettings, writeAgentSettings } from "@/lib/agent-settings.server";
import { createFileRoute } from "@tanstack/react-router";

type Body = {
  apiUrl?: string;
  apiKey?: string;
  apiHeader?: string;
};

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;

        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const nextSettings = {
          apiUrl: body.apiUrl?.trim() || "/api/chat",
          apiKey: body.apiKey?.trim() || "",
          apiHeader: body.apiHeader?.trim() || "Authorization",
        };

        await writeAgentSettings(nextSettings);

        return Response.json({ ok: true, settings: await readAgentSettings() });
      },
      DELETE: async () => {
        await clearAgentSettings();
        return Response.json({ ok: true, settings: await readAgentSettings() });
      },
    },
  },
});