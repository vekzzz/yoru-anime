// Compact catalog index injected into the agent's system context.
// Gives the model real IDs + metadata without dumping the full JSON.
// Full title details (synopsis, episodes) are fetched via get_title tool.

import animeRaw from "../anime.json";

type RawAnime = {
  id: string;
  title: string;
  year: number;
  score: string;
  genres: string[];
  studio: string;
  synopsis: string;
  episodeCount: number;
  episodes: { n: number; title: string; thumbnail: string }[];
};

const anime = animeRaw as RawAnime[];

export type CatalogEntry = {
  id: string;
  title: string;
  year: number;
  score: string;
  genres: string[];
  studio: string;
  episodeCount: number;
};

export const catalogEntries: CatalogEntry[] = anime.map((a) => ({
  id: a.id,
  title: a.title,
  year: a.year,
  score: a.score,
  genres: a.genres,
  studio: a.studio,
  episodeCount: a.episodeCount,
}));

// Valid IDs set for O(1) action validation.
export const validIds = new Set(anime.map((a) => a.id));

// Returns full detail for a single title (used by get_title tool).
export function getTitleDetail(id: string) {
  return anime.find((a) => a.id === id) ?? null;
}

// One-liner text index line per title, used in system prompt.
export function buildCatalogContext(): string {
  return catalogEntries
    .map(
      (e) =>
        `${e.id} | ${e.title} | ${e.year} | score:${e.score} | ${e.genres.join("/")} | ${e.episodeCount}ep`,
    )
    .join("\n");
}
