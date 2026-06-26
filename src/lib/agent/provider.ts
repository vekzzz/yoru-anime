// Provider adapter interface. Swap AGENT_PROVIDER env var to switch backends.
// Both Groq and Gemini implement this interface — the loop depends only on it.

export type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ProviderEvent =
  | { type: "token"; delta: string }
  | { type: "tool_calls"; calls: ToolCall[] }
  | { type: "done" };

export interface AgentProvider {
  stream(req: {
    messages: Message[];
    tools: ToolDefinition[];
    maxTokens: number;
    signal: AbortSignal;
  }): AsyncIterable<ProviderEvent>;
}
