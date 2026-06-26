import { describe, it, expect } from "vitest";
import { runAgentLoop } from "../loop";
import type { AgentProvider, ProviderEvent } from "../provider";
import type { AgentEvent } from "../protocol";

function makeMockProvider(events: ProviderEvent[][]): AgentProvider {
  let call = 0;
  return {
    async *stream() {
      const batch = events[call] ?? [{ type: "done" }];
      call++;
      for (const e of batch) yield e;
    },
  };
}

async function collectEvents(
  provider: AgentProvider,
  userMessage = "test",
): Promise<AgentEvent[]> {
  const results: AgentEvent[] = [];
  const controller = new AbortController();
  for await (const e of runAgentLoop(provider, [], userMessage, controller.signal)) {
    results.push(e);
  }
  return results;
}

describe("runAgentLoop", () => {
  it("simple text response yields tokens then done", async () => {
    const provider = makeMockProvider([
      [
        { type: "token", delta: "Hello" },
        { type: "token", delta: " world" },
        { type: "done" },
      ],
    ]);
    const events = await collectEvents(provider);
    const tokens = events.filter((e) => e.type === "token");
    const done = events.filter((e) => e.type === "done");
    expect(tokens).toHaveLength(2);
    expect(done).toHaveLength(1);
  });

  it("data tool call feeds result back for second turn", async () => {
    const provider = makeMockProvider([
      // First turn: model calls search_catalog
      [
        {
          type: "tool_calls",
          calls: [{ id: "c1", name: "search_catalog", arguments: { query: "action" } }],
        },
        { type: "done" },
      ],
      // Second turn: model responds with text
      [{ type: "token", delta: "Here are some action anime." }, { type: "done" }],
    ]);
    const events = await collectEvents(provider);
    const toolEvents = events.filter((e) => e.type === "tool");
    const tokenEvents = events.filter((e) => e.type === "token");
    expect(toolEvents.length).toBeGreaterThan(0);
    expect(tokenEvents.length).toBeGreaterThan(0);
  });

  it("action tool with valid ID emits action event", async () => {
    const provider = makeMockProvider([
      [
        {
          type: "tool_calls",
          calls: [{ id: "c1", name: "open_title", arguments: { id: "shingeki-no-kyojin" } }],
        },
        { type: "done" },
      ],
      [{ type: "token", delta: "Opening Attack on Titan." }, { type: "done" }],
    ]);
    const events = await collectEvents(provider);
    const actionEvents = events.filter((e) => e.type === "action");
    expect(actionEvents).toHaveLength(1);
    if (actionEvents[0].type === "action") {
      expect(actionEvents[0].action.kind).toBe("open_title");
    }
  });

  it("action tool with invalid ID does NOT emit action event", async () => {
    const provider = makeMockProvider([
      [
        {
          type: "tool_calls",
          calls: [{ id: "c1", name: "open_title", arguments: { id: "hallucinated-show" } }],
        },
        { type: "done" },
      ],
      [{ type: "token", delta: "Sorry." }, { type: "done" }],
    ]);
    const events = await collectEvents(provider);
    const actionEvents = events.filter((e) => e.type === "action");
    expect(actionEvents).toHaveLength(0);
  });

  it("aborts when signal fires", async () => {
    const controller = new AbortController();
    const provider: AgentProvider = {
      async *stream() {
        controller.abort();
        yield { type: "token", delta: "should not appear" };
        yield { type: "done" };
      },
    };
    const events: AgentEvent[] = [];
    for await (const e of runAgentLoop(provider, [], "test", controller.signal)) {
      events.push(e);
    }
    // After abort, we should get few/no token events.
    const tokens = events.filter((e) => e.type === "token");
    expect(tokens).toHaveLength(0);
  });
});
