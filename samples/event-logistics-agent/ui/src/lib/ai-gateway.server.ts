import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "agent-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
