import { describe, it, expect } from "vitest";
import { encodeSSE, parseSSEChunk } from "../protocol";
import type { AgentEvent } from "../protocol";

describe("encodeSSE", () => {
  it("produces valid SSE data line", () => {
    const event: AgentEvent = { type: "token", delta: "hello" };
    const encoded = encodeSSE(event);
    expect(encoded).toBe(`data: ${JSON.stringify(event)}\n\n`);
  });
});

describe("parseSSEChunk", () => {
  it("parses a single token event", () => {
    const event: AgentEvent = { type: "token", delta: "world" };
    const chunk = `data: ${JSON.stringify(event)}\n\n`;
    const parsed = parseSSEChunk(chunk);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(event);
  });

  it("parses multiple events in one chunk", () => {
    const e1: AgentEvent = { type: "token", delta: "foo" };
    const e2: AgentEvent = { type: "done" };
    const chunk = `data: ${JSON.stringify(e1)}\ndata: ${JSON.stringify(e2)}\n`;
    const parsed = parseSSEChunk(chunk);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual(e1);
    expect(parsed[1]).toEqual(e2);
  });

  it("skips malformed lines", () => {
    const chunk = "data: {not_json}\ndata: {}\n";
    expect(() => parseSSEChunk(chunk)).not.toThrow();
  });

  it("ignores non-data lines", () => {
    const event: AgentEvent = { type: "done" };
    const chunk = `event: message\ndata: ${JSON.stringify(event)}\n`;
    const parsed = parseSSEChunk(chunk);
    expect(parsed).toHaveLength(1);
  });
});
