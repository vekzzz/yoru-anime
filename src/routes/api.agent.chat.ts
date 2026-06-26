import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "../lib/agent/rate-limit";
import { createGroqProvider } from "../lib/agent/groq";
import { runAgentLoop } from "../lib/agent/loop";
import { encodeSSE } from "../lib/agent/protocol";
import type { ConversationTurn } from "../lib/agent/loop";

// Server route (TanStack Start): the `server.handlers` map turns this file
// into a raw HTTP endpoint at /api/agent/chat. The client POSTs here and
// reads the Server-Sent Events stream the handler returns.
export const Route = createFileRoute("/api/agent/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "unknown";

        const limitResult = checkRateLimit(ip);
        if (!limitResult.allowed) {
          const payload =
            limitResult.reason === "global"
              ? encodeSSE({ type: "resting" })
              : encodeSSE({
                  type: "rate_limit",
                  retryAfterMs: limitResult.retryAfterMs,
                });
          return new Response(payload, { headers: sseHeaders() });
        }

        let body: { message?: string; history?: ConversationTurn[] };
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "Invalid JSON");
        }

        const userMessage = String(body?.message ?? "").trim();
        if (!userMessage) {
          return jsonError(400, "message required");
        }

        const history: ConversationTurn[] = Array.isArray(body?.history)
          ? body.history.filter(
              (t): t is ConversationTurn =>
                (t.role === "user" || t.role === "assistant") &&
                typeof t.content === "string",
            )
          : [];

        const apiKey = process.env["GROQ_API_KEY"];
        if (!apiKey) {
          return new Response(
            encodeSSE({ type: "error", message: "Agent unavailable." }),
            { headers: sseHeaders() },
          );
        }

        const model = process.env["GROQ_MODEL"];
        const provider = createGroqProvider(apiKey, model);

        const abortController = new AbortController();
        request.signal.addEventListener("abort", () => abortController.abort());

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const agentEvent of runAgentLoop(
                provider,
                history,
                userMessage,
                abortController.signal,
              )) {
                if (abortController.signal.aborted) break;
                controller.enqueue(encoder.encode(encodeSSE(agentEvent)));
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Unknown error";
              console.error("[agent] loop error:", msg);
              controller.enqueue(
                encoder.encode(
                  encodeSSE({ type: "error", message: "Something went wrong." }),
                ),
              );
            } finally {
              controller.close();
            }
          },
          cancel() {
            abortController.abort();
          },
        });

        return new Response(stream, { headers: sseHeaders() });
      },
    },
  },
});

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
