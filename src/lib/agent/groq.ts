import type { AgentProvider, Message, ProviderEvent, ToolCall, ToolDefinition } from "./provider";

const BASE_URL = "https://api.groq.com/openai/v1";

// Cheapest Groq model with reliable tool-calling support.
// llama-3.1-8b-instant: fast + cheap, supports function calls.
// Override via GROQ_MODEL env var if you want to upgrade tier.
const DEFAULT_MODEL = "llama-3.1-8b-instant";

export function createGroqProvider(apiKey: string, model = DEFAULT_MODEL): AgentProvider {
  return {
    async *stream({ messages, tools, maxTokens, signal }) {
      const body = JSON.stringify({
        model,
        messages,
        tools: tools.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })),
        tool_choice: "auto",
        stream: true,
        max_tokens: maxTokens,
      });

      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body,
        signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`);
      }

      if (!res.body) throw new Error("Groq returned no body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Accumulate partial tool calls across stream chunks.
      const pendingCalls: Map<
        number,
        { id: string; name: string; argsRaw: string }
      > = new Map();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") return;

            let chunk: GroqChunk;
            try {
              chunk = JSON.parse(raw);
            } catch {
              continue;
            }

            const choice = chunk.choices?.[0];
            if (!choice) continue;

            const delta = choice.delta;

            if (delta.content) {
              yield { type: "token", delta: delta.content } satisfies ProviderEvent;
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const existing = pendingCalls.get(tc.index) ?? {
                  id: "",
                  name: "",
                  argsRaw: "",
                };
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.name = tc.function.name;
                if (tc.function?.arguments) existing.argsRaw += tc.function.arguments;
                pendingCalls.set(tc.index, existing);
              }
            }

            if (choice.finish_reason === "tool_calls" || choice.finish_reason === "stop") {
              if (pendingCalls.size > 0) {
                const calls: ToolCall[] = [];
                for (const [, pc] of pendingCalls) {
                  let args: Record<string, unknown> = {};
                  try {
                    args = JSON.parse(pc.argsRaw);
                  } catch {
                    // malformed args — pass empty
                  }
                  calls.push({ id: pc.id, name: pc.name, arguments: args });
                }
                yield { type: "tool_calls", calls } satisfies ProviderEvent;
                pendingCalls.clear();
              }
              yield { type: "done" } satisfies ProviderEvent;
              return;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      yield { type: "done" } satisfies ProviderEvent;
    },
  };
}

// Minimal Groq streaming chunk shape we actually parse.
type GroqChunk = {
  choices?: Array<{
    index: number;
    delta: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
};
