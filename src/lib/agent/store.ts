// Ephemeral client-side chat store. SSR-safe (empty server snapshot).
// Clears on page reload — no localStorage persistence intentional.

import { useSyncExternalStore } from "react";
import type { ActionEvent } from "./protocol";

export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; done: boolean }
  | { role: "action"; event: ActionEvent; label: string };

export type AgentStatus = "idle" | "streaming" | "error" | "rate_limited" | "resting";

type State = {
  messages: ChatMessage[];
  status: AgentStatus;
  retryAfterMs: number | null;
  open: boolean;
};

let state: State = {
  messages: [],
  status: "idle",
  retryAfterMs: null,
  open: false,
};

const listeners = new Set<() => void>();
const serverSnapshot: State = { messages: [], status: "idle", retryAfterMs: null, open: false };

function emit() {
  for (const l of listeners) l();
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function openAgent(seedMessage?: string) {
  setState({ open: true });
  if (seedMessage && state.messages.length === 0) {
    // Pre-seed the input — handled by AgentComposer reading from store.
    agentStore._seed = seedMessage;
    emit();
  }
}

export function closeAgent() {
  setState({ open: false });
}

export function toggleAgent() {
  setState({ open: !state.open });
}

// Append a streaming assistant message. Returns an updater for delta tokens.
export function startAssistantMessage(): () => void {
  const idx = state.messages.length;
  setState({
    messages: [...state.messages, { role: "assistant", content: "", done: false }],
    status: "streaming",
  });
  return () => {
    // Finalise the message.
    setState({
      messages: state.messages.map((m, i) =>
        i === idx && m.role === "assistant" ? { ...m, done: true } : m,
      ),
      status: "idle",
    });
  };
}

export function appendToken(delta: string) {
  const msgs = state.messages;
  const last = msgs[msgs.length - 1];
  if (!last || last.role !== "assistant") return;
  setState({
    messages: [
      ...msgs.slice(0, -1),
      { ...last, content: last.content + delta },
    ],
  });
}

export function pushUserMessage(content: string) {
  setState({
    messages: [...state.messages, { role: "user", content }],
  });
}

export function pushActionMessage(event: ActionEvent, label: string) {
  setState({
    messages: [...state.messages, { role: "action", event, label }],
  });
}

export function setError(message: string) {
  const msgs = state.messages;
  const last = msgs[msgs.length - 1];
  // Patch the streaming message to show error, or append.
  if (last?.role === "assistant" && !last.done) {
    setState({
      messages: [...msgs.slice(0, -1), { ...last, content: message, done: true }],
      status: "error",
    });
  } else {
    setState({
      messages: [...msgs, { role: "assistant", content: message, done: true }],
      status: "error",
    });
  }
}

export function setRateLimited(retryAfterMs: number) {
  setState({ status: "rate_limited", retryAfterMs });
}

export function setResting() {
  setState({ status: "resting" });
}

export function resetStatus() {
  setState({ status: "idle", retryAfterMs: null });
}

// Derive conversation history for the API request (user + assistant turns only).
export function getHistory() {
  return state.messages
    .filter((m): m is { role: "user" | "assistant"; content: string; done?: boolean } =>
      m.role === "user" || m.role === "assistant",
    )
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

// React hook.
export function useAgentStore() {
  return useSyncExternalStore(subscribe, () => state, () => serverSnapshot);
}

// Internal mutable ref for seed message (not part of React state).
export const agentStore = {
  _seed: "" as string,
  takeSeed(): string {
    const s = this._seed;
    this._seed = "";
    return s;
  },
};
