// Shared SSE event types for the agent streaming protocol.
// Imported by both the server route and the client store — single source of truth.

export type TokenEvent = { type: "token"; delta: string };
export type ToolEvent = { type: "tool"; name: string; status: "running" | "done" };
export type ActionEvent = {
  type: "action";
  action:
    | { kind: "open_title"; id: string; title: string }
    | { kind: "play_episode"; id: string; ep: number; title: string }
    | { kind: "add_watchlist"; id: string; title: string }
    | { kind: "remove_watchlist"; id: string; title: string }
    | { kind: "navigate"; to: string };
};
export type ErrorEvent = { type: "error"; message: string };
export type RateLimitEvent = { type: "rate_limit"; retryAfterMs: number };
export type RestingEvent = { type: "resting" };
export type DoneEvent = { type: "done" };

export type AgentEvent =
  | TokenEvent
  | ToolEvent
  | ActionEvent
  | ErrorEvent
  | RateLimitEvent
  | RestingEvent
  | DoneEvent;

// Serialize an event to an SSE data line.
export function encodeSSE(event: AgentEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Parse SSE data lines from a chunk string. Handles partial lines by returning
// only complete events.
export function parseSSEChunk(chunk: string): AgentEvent[] {
  const events: AgentEvent[] = [];
  const lines = chunk.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    try {
      events.push(JSON.parse(line.slice(6)) as AgentEvent);
    } catch {
      // malformed line — skip
    }
  }
  return events;
}
