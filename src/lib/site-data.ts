// Content layer for YORU. Catalog data is real anime pulled from AniList's
// public API (see scripts/fetch-anime.mjs) and baked into anime.json. Cover,
// banner, and episode-still art is hotlinked from the AniList / Crunchyroll
// CDNs and remains the copyright of the respective studios — fine for a demo,
// license before any commercial launch. Brand, testimonials and marketing copy
// are original.
import animeRaw from "./anime.json";

export const brand = {
  name: "YORU",
  tagline: "night, on demand",
} as const;

export const nav = [
  { label: "Browse", href: "/browse" },
  { label: "This season", href: "/#season" },
  { label: "Genres", href: "/#genres" },
  { label: "Why YORU", href: "/#why" },
] as const;

type RawAnime = {
  id: string;
  title: string;
  year: number;
  rating: string;
  score: string;
  genres: string[];
  studio: string;
  cover: string;
  banner: string;
  trailer: string | null;
  color: string;
  synopsis: string;
  episodeCount: number;
  episodes: { n: number; title: string; thumbnail: string }[];
};

const anime = animeRaw as RawAnime[];

export type Series = {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: string;
  img: string;
};

export const catalog: Series[] = anime.map((a) => ({
  id: a.id,
  title: a.title,
  genre: a.genres[0] ?? "Anime",
  year: a.year,
  rating: a.rating,
  img: a.cover,
}));

export const trending: Series[] = catalog.slice(0, 12);

export const genreList: string[] = Array.from(
  new Set(anime.flatMap((a) => a.genres)),
).sort();

// ---------------------------------------------------------------------------
// Featured (homepage cinematic reel) — first three with a usable banner.
// ---------------------------------------------------------------------------

export type Featured = {
  id: string;
  title: string;
  genre: string;
  episodes: string;
  blurb: string;
  img: string;
};

const short = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;

export const featured: Featured[] = anime
  .filter((a) => a.banner)
  .slice(0, 3)
  .map((a) => ({
    id: a.id,
    title: a.title,
    genre: a.genres.slice(0, 2).join(" · "),
    episodes: `${a.episodeCount} episodes`,
    blurb: short(a.synopsis, 190),
    img: a.banner,
  }));

// Homepage hero spotlight (portrait key-art).
export const heroSpotlight = {
  id: anime[0]?.id ?? "",
  title: trending[0]?.title ?? "Tonight on YORU",
  poster: trending[0]?.img ?? "",
  posterBack: trending[1]?.img ?? "",
  trailerId: anime[0]?.trailer ?? null,
  note: "New episode this week",
};

// ---------------------------------------------------------------------------
// Genre bento — top genres by catalog size, each with a representative banner.
// ---------------------------------------------------------------------------

export type Genre = {
  name: string;
  count: string;
  span: string;
  img: string;
};

const SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-2",
  "",
  "",
  "md:col-span-2",
  "",
  "",
];

const genreCount = new Map<string, number>();
for (const a of anime)
  for (const g of a.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);

const bannerForGenre = (name: string) =>
  anime.find((a) => a.genres.includes(name) && a.banner)?.banner ??
  anime.find((a) => a.genres.includes(name))?.cover ??
  "";

export const genres: Genre[] = [...genreCount.entries()]
  .filter(([name]) => bannerForGenre(name))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 7)
  .map(([name, count], i) => ({
    name,
    count: `${count} ${count === 1 ? "title" : "titles"}`,
    span: SPANS[i] ?? "",
    img: bannerForGenre(name),
  }));

// ---------------------------------------------------------------------------
// Testimonials (original copy)
// ---------------------------------------------------------------------------

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  /** Demo portrait (i.pravatar.cc); swap for a real, consented photo. */
  avatar: string;
  /** Catalog id of the series this fan is currently watching. */
  seriesId: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Came for one show, lost a whole weekend. The simulcast speed is genuinely unreal.",
    name: "Mariko Tanigawa",
    location: "Osaka",
    avatar: "https://i.pravatar.cc/160?img=47",
    seriesId: "jujutsu-kaisen",
  },
  {
    quote:
      "Finally a player that remembers where I left off across my phone and my TV.",
    name: "Devon Amaro",
    location: "Lisbon",
    avatar: "https://i.pravatar.cc/160?img=33",
    seriesId: "shingeki-no-kyojin",
  },
  {
    quote:
      "The dub catalog is stacked. My partner who hates subtitles is fully hooked now.",
    name: "Priya Nair",
    location: "Leeds",
    avatar: "https://i.pravatar.cc/160?img=5",
    seriesId: "kimetsu-no-yaiba",
  },
];

// Short one-liners for the scrolling reaction marquee (original copy).
export const fanReactions: string[] = [
  "Watching before the subs even hit my timeline.",
  "Switched from three other apps. Not going back.",
  "The 4K on the new season is unreal.",
  "Offline downloads saved my whole flight.",
  "Caught up on a 25-episode run in one weekend.",
  "Sub and dub in one tap. Perfect.",
  "No ads on premium actually means no ads.",
  "My spot syncs to the TV before I sit down.",
];

export type Feature = {
  title: string;
  body: string;
  stat?: string;
};

export const features: Feature[] = [
  {
    title: "Simulcast within the hour",
    body: "New episodes stream the same day as Japan, usually inside sixty minutes of broadcast. No waiting a week, no spoilers on your timeline.",
    stat: "< 1 hr",
  },
  {
    title: "Sub or dub, your call",
    body: "Switch language and subtitle track mid-episode without losing your place. The dub catalog is real, not an afterthought.",
  },
  {
    title: "Download for the commute",
    body: "Pull episodes onto your phone and watch on the train, on a flight, anywhere the signal dies.",
  },
  {
    title: "Picks up where you left off",
    body: "Start on your phone, finish on the TV. Your spot syncs across every device the second you pause.",
    stat: "Every device",
  },
];

export const footerLinks: { heading: string; items: string[] }[] = [
  { heading: "Watch", items: ["Browse all", "This season", "Simulcasts", "Genres", "Watchlist"] },
  { heading: "YORU", items: ["About", "Careers", "Press", "Devices", "Gift cards"] },
  { heading: "Support", items: ["Help center", "Account", "Redeem code", "Contact"] },
];

// ---------------------------------------------------------------------------
// Series detail (watch page)
// ---------------------------------------------------------------------------

export type Episode = {
  n: number;
  title: string;
  duration: string;
  synopsis: string;
  img: string;
};

export type SeriesDetail = Series & {
  score: string;
  studio: string;
  seasonLabel: string;
  tags: string[];
  synopsis: string;
  backdrop: string;
  trailerId: string | null;
  episodes: Episode[];
};

export function getSeriesDetail(id: string): SeriesDetail | null {
  const a = anime.find((x) => x.id === id);
  if (!a) return null;

  const source =
    a.episodes.length > 0
      ? a.episodes
      : Array.from({ length: Math.min(a.episodeCount || 12, 12) }, (_, i) => ({
          n: i + 1,
          title: `Episode ${i + 1}`,
          thumbnail: a.banner || a.cover,
        }));

  const episodes: Episode[] = source.map((e, i) => ({
    n: i + 1,
    title: e.title,
    duration: "24m",
    synopsis: "",
    img: e.thumbnail || a.banner || a.cover,
  }));

  return {
    id: a.id,
    title: a.title,
    genre: a.genres[0] ?? "Anime",
    year: a.year,
    rating: a.rating,
    img: a.cover,
    score: a.score,
    studio: a.studio,
    seasonLabel: `${a.episodeCount} episodes`,
    tags: a.genres,
    synopsis: a.synopsis,
    backdrop: a.banner || a.cover,
    trailerId: a.trailer,
    episodes,
  };
}

/** "More like this": same lead genre first, then fill from the catalog. */
export function getRelated(id: string, limit = 6): Series[] {
  const self = catalog.find((s) => s.id === id);
  const sameGenre = catalog.filter(
    (s) => s.id !== id && self && s.genre === self.genre,
  );
  const rest = catalog.filter((s) => s.id !== id && !sameGenre.includes(s));
  return [...sameGenre, ...rest].slice(0, limit);
}
