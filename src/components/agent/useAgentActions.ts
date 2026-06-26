// Executes validated ACTION events from the agent on behalf of the client.
// Only place that touches watchlist/progress stores and the router from agent events.

import { useNavigate } from "@tanstack/react-router";
import type { ActionEvent } from "#/lib/agent/protocol";
import { toggleWatchlist, isInWatchlist } from "#/lib/watchlist";
import {
  pushActionMessage,
  appendToken,
  startAssistantMessage,
  pushUserMessage,
  setError,
  setRateLimited,
  setResting,
  getHistory,
} from "#/lib/agent/store";
import { parseSSEChunk } from "#/lib/agent/protocol";

export function useAgentActions() {
  const navigate = useNavigate();

  function executeAction(event: ActionEvent) {
    const { action } = event;

    switch (action.kind) {
      case "open_title":
        navigate({ to: "/watch/$id", params: { id: action.id } });
        pushActionMessage(event, `Opening ${action.title}…`);
        break;

      case "play_episode":
        navigate({
          to: "/watch/$id/$ep",
          params: { id: action.id, ep: String(action.ep) },
        });
        pushActionMessage(event, `Playing ${action.title} ep ${action.ep}…`);
        break;

      case "add_watchlist":
        if (!isInWatchlist(action.id)) toggleWatchlist(action.id);
        pushActionMessage(event, `Added ${action.title} to your list.`);
        break;

      case "remove_watchlist":
        if (isInWatchlist(action.id)) toggleWatchlist(action.id);
        pushActionMessage(event, `Removed ${action.title} from your list.`);
        break;

      case "navigate":
        navigate({ to: action.to as "/" });
        pushActionMessage(event, `Navigating…`);
        break;
    }
  }

  async function sendMessage(userMessage: string) {
    // Capture history BEFORE pushing new user message to avoid duplication.
    const history = getHistory();
    pushUserMessage(userMessage);
    const finalize = startAssistantMessage();
    const abortController = new AbortController();

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) {
        finalize();
        setError("Couldn't reach the agent. Try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const chunk of lines) {
          const events = parseSSEChunk(chunk);
          for (const event of events) {
            switch (event.type) {
              case "token":
                appendToken(event.delta);
                break;
              case "action":
                executeAction(event);
                break;
              case "error":
                finalize();
                setError(event.message);
                return;
              case "rate_limit":
                finalize();
                setRateLimited(event.retryAfterMs);
                return;
              case "resting":
                finalize();
                setResting();
                return;
              case "done":
                finalize();
                return;
              // "tool" events — no client action needed (status UI handled by streaming indicator)
            }
          }
        }
      }

      finalize();
    } catch (err) {
      finalize();
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Connection lost. Try again.");
      }
    }

    return () => abortController.abort();
  }

  return { sendMessage, executeAction };
}
