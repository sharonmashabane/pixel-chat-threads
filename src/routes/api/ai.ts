import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

import { createResponsesCall } from "@/server/ai/responses";
import { buildInstructions, type AiMode, type AiStyle } from "@/server/ai/prompts";

const MODES: AiMode[] = ["chat", "planner", "research"];
const STYLES: AiStyle[] = ["concise", "balanced", "detailed"];

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return json(500, "AI service is not configured.");

        let body: { messages?: UIMessage[]; mode?: string; style?: string };
        try {
          body = await request.json();
        } catch {
          return json(400, "Invalid request.");
        }
        const mode = MODES.includes(body.mode as AiMode) ? (body.mode as AiMode) : null;
        if (!mode) return json(400, "Unknown AI feature.");
        const style = STYLES.includes(body.style as AiStyle) ? (body.style as AiStyle) : "balanced";
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return json(400, "Please enter a message.");
        }
        const messages = body.messages.slice(-40);
        const text = JSON.stringify(messages);
        if (text.length > 120_000) return json(400, "Your input is too long. Please shorten it.");

        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          buildInstructions(mode, style),
        );
        return call.response();
      },
    },
  },
});
