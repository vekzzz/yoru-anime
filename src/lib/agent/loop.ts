// Agent orchestration loop. Drives the agentic tool-call cycle:
//   model turn → tool calls → resolve on server → next model turn → ...
// Yields AgentEvents consumed by the SSE route.

import type { AgentProvider, Message } from "./provider";
import type { AgentEvent } from "./protocol";
import { toolDefinitions, runTool } from "./tools";
import { buildSystemPrompt } from "./prompt";

const MAX_TOOL_ROUNDS = 5; // prevent infinite loops
const MAX_TOKENS = 512; // per model turn — bounds cost
const MAX_HISTORY_TURNS = 10; // truncate old turns to bound context size

export type UserMessage = { role: "user"; content: string };
export type AssistantMessage = { role: "assistant"; content: string };
export type ConversationTurn = UserMessage | AssistantMessage;

export async function* runAgentLoop(
  provider: AgentProvider,
  history: ConversationTurn[],
  userMessage: string,
  signal: AbortSignal,
): AsyncGenerator<AgentEvent> {
  // Build message list: system + truncated history + new user message.
  const systemMessage: Message = {
    role: "system",
    content: buildSystemPrompt(),
  };

  // Keep last N turns to bound context. Always include full history on short
  // convos; truncate oldest turns on long ones.
  const historySlice = history.slice(-MAX_HISTORY_TURNS);
  const messages: Message[] = [
    systemMessage,
    ...historySlice.map((t) => ({ role: t.role, content: t.content } as Message)),
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (signal.aborted) return;

    let assistantContent = "";
    let toolCallsPending: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

    // Stream one model turn.
    for await (const event of provider.stream({ messages, tools: toolDefinitions, maxTokens: MAX_TOKENS, signal })) {
      if (signal.aborted) return;

      if (event.type === "token") {
        assistantContent += event.delta;
        yield { type: "token", delta: event.delta };
      } else if (event.type === "tool_calls") {
        toolCallsPending = event.calls;
      } else if (event.type === "done") {
        break;
      }
    }

    if (signal.aborted) return;

    // No tool calls → conversation turn complete.
    if (toolCallsPending.length === 0) {
      yield { type: "done" };
      return;
    }

    // Add assistant message with tool call intent to history (required by API).
    messages.push({ role: "assistant", content: assistantContent || "" });

    // Resolve each tool call.
    for (const call of toolCallsPending) {
      if (signal.aborted) return;

      yield { type: "tool", name: call.name, status: "running" };

      const result = runTool(call.name, call.arguments);

      yield { type: "tool", name: call.name, status: "done" };

      if (result.type === "action") {
        // Validated action: emit to client, give model a confirmation string.
        yield result.event;
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.name,
          content: `Action executed: ${call.name} for id "${(call.arguments.id as string) ?? ""}"`,
        });
      } else {
        // Data or error: feed result back into next model turn.
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.name,
          content: result.content,
        });
      }
    }

    // Loop back for next model turn with tool results in context.
  }

  // Exhausted tool rounds — stop cleanly.
  yield { type: "done" };
}
