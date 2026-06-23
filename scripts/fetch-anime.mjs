// One-off: pull popular anime from AniList's public GraphQL API and bake a
// static JSON the app reads. Re-run with `node scripts/fetch-anime.mjs` to
// refresh. Cover/banner art is hotlinked from AniList's CDN and remains the
// copyright of the respective studios — fine for a demo, license for launch.
import { writeFileSync } from "node:fs";

const QUERY = `
query ($perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(sort: POPULARITY_DESC, type: ANIME, format_in: [TV, MOVIE], isAdult: false) {
      title { romaji english }
      seasonYear
      episodes
      averageScore
      genres
      isAdult
      description(asHtml: false)
      coverImage { extraLarge large color }
      bannerImage
      trailer { id site }
      studios(isMain: true) { nodes { name } }
      streamingEpisodes { title thumbnail }
    }
  }
}`;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);

const clean = (d) =>
  (d ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const res = await fetch("https://graphql.anilist.co", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ query: QUERY, variables: { perPage: 36 } }),
});

if (!res.ok) {
  console.error("AniList error", res.status, await res.text());
  process.exit(1);
}

const json = await res.json();
const media = json.data.Page.media;
const seen = new Set();

const out = [];
for (const m of media) {
  const title = m.title.english || m.title.romaji;
  if (!title || !m.coverImage?.large) continue;
  let id = slug(m.title.romaji || title);
  if (!id || seen.has(id)) id = `${id}-${out.length}`;
  seen.add(id);

  const desc = clean(m.description);
  const eps = (m.streamingEpisodes ?? [])
    .filter((e) => e.title && e.thumbnail)
    .slice(0, 16)
    .map((e, i) => ({
      n: i + 1,
      title: clean(e.title).replace(/^Episode\s*\d+\s*[-–·:]?\s*/i, "") || `Episode ${i + 1}`,
      thumbnail: e.thumbnail,
    }));

  out.push({
    id,
    title,
    year: m.seasonYear ?? 2024,
    rating: m.isAdult ? "TV-MA" : "TV-14",
    score: m.averageScore ? (m.averageScore / 10).toFixed(1) : "8.0",
    genres: (m.genres ?? []).slice(0, 3),
    studio: m.studios?.nodes?.[0]?.name ?? "Studio",
    cover: m.coverImage.extraLarge || m.coverImage.large,
    banner: m.bannerImage || m.coverImage.extraLarge || m.coverImage.large,
    trailer: m.trailer && m.trailer.site === "youtube" ? m.trailer.id : null,
    color: m.coverImage.color || "#22d3ee",
    synopsis: desc.length > 360 ? desc.slice(0, 357).trimEnd() + "..." : desc,
    episodeCount: m.episodes ?? eps.length ?? 12,
    episodes: eps,
  });
}

writeFileSync(
  new URL("../src/lib/anime.json", import.meta.url),
  JSON.stringify(out, null, 2),
);
console.log(`Wrote ${out.length} titles to src/lib/anime.json`);
console.log(out.slice(0, 5).map((s) => `${s.id} — ${s.title} (${s.episodes.length} eps)`).join("\n"));
