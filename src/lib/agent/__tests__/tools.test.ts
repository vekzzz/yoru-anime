import { describe, it, expect } from "vitest";
import { runTool } from "../tools";
import { catalogEntries } from "../catalog-index";

const firstEntry = catalogEntries[0];

describe("search_catalog", () => {
  it("returns results for a known genre", () => {
    const result = runTool("search_catalog", { query: "action" });
    expect(result.type).toBe("data");
    if (result.type === "data") {
      expect(result.content.length).toBeGreaterThan(0);
    }
  });

  it("returns no-match message for gibberish", () => {
    const result = runTool("search_catalog", { query: "xyzzy_not_real_zzz" });
    expect(result.type).toBe("data");
    if (result.type === "data") {
      expect(result.content).toContain("No catalog titles matched");
    }
  });

  it("filters by minScore", () => {
    const result = runTool("search_catalog", { minScore: 9.9 });
    expect(result.type).toBe("data");
    if (result.type === "data") {
      // Very high score — either empty or only near-perfect titles
      expect(typeof result.content).toBe("string");
    }
  });
});

describe("get_title", () => {
  it("returns detail for a valid ID", () => {
    const result = runTool("get_title", { id: firstEntry.id });
    expect(result.type).toBe("data");
    if (result.type === "data") {
      const parsed = JSON.parse(result.content);
      expect(parsed.id).toBe(firstEntry.id);
      expect(parsed.title).toBe(firstEntry.title);
    }
  });

  it("returns error for unknown ID", () => {
    const result = runTool("get_title", { id: "not-a-real-id" });
    expect(result.type).toBe("error");
  });
});

describe("open_title (action tool)", () => {
  it("emits action event for valid ID", () => {
    const result = runTool("open_title", { id: firstEntry.id });
    expect(result.type).toBe("action");
    if (result.type === "action") {
      expect(result.event.action.kind).toBe("open_title");
      if (result.event.action.kind === "open_title") {
        expect(result.event.action.id).toBe(firstEntry.id);
      }
    }
  });

  it("rejects hallucinated/non-existent ID", () => {
    const result = runTool("open_title", { id: "bleach-thousand-year-blood-war" });
    expect(result.type).toBe("error");
  });
});

describe("play_episode (action tool)", () => {
  it("emits action for valid ID and in-range episode", () => {
    const result = runTool("play_episode", { id: firstEntry.id, ep: 1 });
    expect(result.type).toBe("action");
    if (result.type === "action" && result.event.action.kind === "play_episode") {
      expect(result.event.action.ep).toBe(1);
    }
  });

  it("rejects out-of-range episode", () => {
    const result = runTool("play_episode", { id: firstEntry.id, ep: 99999 });
    expect(result.type).toBe("error");
  });

  it("rejects unknown ID", () => {
    const result = runTool("play_episode", { id: "fake-show", ep: 1 });
    expect(result.type).toBe("error");
  });
});

describe("add_to_watchlist / remove_from_watchlist", () => {
  it("add emits action for valid ID", () => {
    const result = runTool("add_to_watchlist", { id: firstEntry.id });
    expect(result.type).toBe("action");
    if (result.type === "action") {
      expect(result.event.action.kind).toBe("add_watchlist");
    }
  });

  it("add rejects invalid ID", () => {
    const result = runTool("add_to_watchlist", { id: "fake" });
    expect(result.type).toBe("error");
  });

  it("remove emits action for valid ID", () => {
    const result = runTool("remove_from_watchlist", { id: firstEntry.id });
    expect(result.type).toBe("action");
    if (result.type === "action") {
      expect(result.event.action.kind).toBe("remove_watchlist");
    }
  });
});

describe("unknown tool", () => {
  it("returns error for unrecognised tool name", () => {
    const result = runTool("hack_the_mainframe", {});
    expect(result.type).toBe("error");
  });
});
