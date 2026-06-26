// Agent tool schemas and server-side resolvers.
// DATA tools run inside the loop on the server — results fed back to the model.
// ACTION tools are validated here, then emitted as ActionEvent to the client.

import type { ToolDefinition } from "./provider";
import type { ActionEvent } from "./protocol";
import { catalogEntries, getTitleDetail, validIds } from "./catalog-index";

export const toolDefinitions: ToolDefinition[] = [
  // ---- DATA tools -----------------------------------------------------------
  {
    name: "search_catalog",
    description:
      "Search the YORU catalog. Use this when the user asks for recommendations or searches by genre, year, score, or keyword. Returns matching titles with IDs.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword, genre, or title fragment to search for.",
        },
        genre: { type: "string", description: "Filter by genre (e.g. Action, Fantasy)." },
        minScore: { type: "number", description: "Minimum AniList score (0–10)." },
        maxEpisodes: { type: "number", description: "Maximum episode count." },
      },
      required: [],
    },
  },
  {
    name: "get_title",
    description:
      "Get full detail for a catalog title by ID: synopsis, episode list, studio, score. Call this before recommending or describing a specific title.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Title ID from the catalog." },
      },
      required: ["id"],
    },
  },
  // ---- ACTION tools ---------------------------------------------------------
  {
    name: "open_title",
    description: "Navigate the user to a title's detail page.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Title ID." },
      },
      required: ["id"],
    },
  },
  {
    name: "play_episode",
    description: "Navigate the user to a specific episode of a title.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Title ID." },
        ep: { type: "number", description: "Episode number (1-indexed)." },
      },
      required: ["id", "ep"],
    },
  },
  {
    name: "add_to_watchlist",
    description: "Add a title to the user's watchlist.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Title ID." },
      },
      required: ["id"],
    },
  },
  {
    name: "remove_from_watchlist",
    description: "Remove a title from the user's watchlist.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Title ID." },
      },
      required: ["id"],
    },
  },
];

export type ToolResult =
  | { type: "data"; content: string }
  | { type: "action"; event: ActionEvent }
  | { type: "error"; content: string };

// Run a tool call. DATA tools return content for the next model turn.
// ACTION tools are validated against the real catalog and return an action event
// (never touches unknown IDs — hallucinated title calls are dropped as errors).
export function runTool(
  name: string,
  args: Record<string, unknown>,
): ToolResult {
  switch (name) {
    case "search_catalog":
      return runSearchCatalog(args);

    case "get_title": {
      const id = String(args.id ?? "");
      const detail = getTitleDetail(id);
      if (!detail) {
        return { type: "error", content: `No title with id "${id}" in catalog.` };
      }
      return {
        type: "data",
        content: JSON.stringify({
          id: detail.id,
          title: detail.title,
          year: detail.year,
          score: detail.score,
          genres: detail.genres,
          studio: detail.studio,
          episodeCount: detail.episodeCount,
          synopsis: detail.synopsis,
          episodes: detail.episodes.slice(0, 5).map((e) => ({ n: e.n, title: e.title })),
        }),
      };
    }

    case "open_title": {
      const id = String(args.id ?? "");
      if (!validIds.has(id)) {
        return { type: "error", content: `Cannot open — "${id}" not in catalog.` };
      }
      const entry = catalogEntries.find((e) => e.id === id)!;
      return {
        type: "action",
        event: { type: "action", action: { kind: "open_title", id, title: entry.title } },
      };
    }

    case "play_episode": {
      const id = String(args.id ?? "");
      const ep = Number(args.ep ?? 1);
      if (!validIds.has(id)) {
        return { type: "error", content: `Cannot play — "${id}" not in catalog.` };
      }
      const entry = catalogEntries.find((e) => e.id === id)!;
      if (ep < 1 || ep > entry.episodeCount) {
        return {
          type: "error",
          content: `Episode ${ep} out of range for "${entry.title}" (1–${entry.episodeCount}).`,
        };
      }
      return {
        type: "action",
        event: { type: "action", action: { kind: "play_episode", id, ep, title: entry.title } },
      };
    }

    case "add_to_watchlist": {
      const id = String(args.id ?? "");
      if (!validIds.has(id)) {
        return { type: "error", content: `Cannot add — "${id}" not in catalog.` };
      }
      const entry = catalogEntries.find((e) => e.id === id)!;
      return {
        type: "action",
        event: { type: "action", action: { kind: "add_watchlist", id, title: entry.title } },
      };
    }

    case "remove_from_watchlist": {
      const id = String(args.id ?? "");
      if (!validIds.has(id)) {
        return { type: "error", content: `Cannot remove — "${id}" not in catalog.` };
      }
      const entry = catalogEntries.find((e) => e.id === id)!;
      return {
        type: "action",
        event: { type: "action", action: { kind: "remove_watchlist", id, title: entry.title } },
      };
    }

    default:
      return { type: "error", content: `Unknown tool: ${name}` };
  }
}

function runSearchCatalog(args: Record<string, unknown>): ToolResult {
  const query = String(args.query ?? "").toLowerCase().trim();
  const genre = String(args.genre ?? "").toLowerCase().trim();
  const minScore = args.minScore != null ? Number(args.minScore) : null;
  const maxEpisodes = args.maxEpisodes != null ? Number(args.maxEpisodes) : null;

  let results = catalogEntries;

  if (query) {
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.genres.some((g) => g.toLowerCase().includes(query)) ||
        e.studio.toLowerCase().includes(query),
    );
  }
  if (genre) {
    results = results.filter((e) =>
      e.genres.some((g) => g.toLowerCase().includes(genre)),
    );
  }
  if (minScore != null) {
    results = results.filter((e) => parseFloat(e.score) >= minScore);
  }
  if (maxEpisodes != null) {
    results = results.filter((e) => e.episodeCount <= maxEpisodes);
  }

  if (results.length === 0) {
    return { type: "data", content: "No catalog titles matched your search." };
  }

  const lines = results
    .slice(0, 12)
    .map(
      (e) =>
        `${e.id} | ${e.title} | ${e.year} | score:${e.score} | ${e.genres.join("/")} | ${e.episodeCount}ep`,
    )
    .join("\n");

  return { type: "data", content: lines };
}
