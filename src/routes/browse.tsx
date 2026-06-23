import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { catalog, genreList } from "../lib/site-data";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { PosterCard } from "../components/PosterCard";

type BrowseSearch = { q?: string; genre?: string };

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    genre:
      typeof search.genre === "string" && search.genre
        ? search.genre
        : undefined,
  }),
  component: Browse,
});

function Browse() {
  const { q, genre } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = (next: Partial<BrowseSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  const query = (q ?? "").toLowerCase();
  const results = catalog.filter(
    (s) =>
      (!genre || s.genre === genre) &&
      (!query || s.title.toLowerCase().includes(query)),
  );

  return (
    <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
      <Nav />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8 lg:pt-40">
        <Reveal>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white lg:text-6xl">
            Browse all anime
          </h1>
          <p className="mt-3 text-zinc-400">
            {catalog.length} series streaming now. Find your next one.
          </p>
        </Reveal>

        {/* Search */}
        <div className="mt-10 max-w-xl">
          <label htmlFor="browse-q" className="sr-only">
            Search anime by title
          </label>
          <div className="relative">
            <Search
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
            />
            <input
              id="browse-q"
              type="search"
              value={q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
              placeholder="Search titles"
              className="w-full rounded-full border border-white/15 bg-night-900 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        {/* Genre filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip active={!genre} onClick={() => setSearch({ genre: undefined })}>
            All
          </Chip>
          {genreList.map((g) => (
            <Chip
              key={g}
              active={genre === g}
              onClick={() =>
                setSearch({ genre: genre === g ? undefined : g })
              }
            >
              {g}
            </Chip>
          ))}
        </div>

        {/* Results */}
        <p className="mt-8 text-sm text-zinc-500">
          {results.length} {results.length === 1 ? "result" : "results"}
          {genre ? ` in ${genre}` : ""}
          {q ? ` for “${q}”` : ""}
        </p>

        {results.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((s) => (
              <PosterCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-night-900 p-10">
            <p className="font-display text-2xl font-semibold text-white">
              Nothing matches that yet
            </p>
            <p className="max-w-md text-zinc-400">
              Try a different title or clear your filters. New simulcasts land
              every week.
            </p>
            <button
              type="button"
              onClick={() => setSearch({ q: undefined, genre: undefined })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/45 hover:bg-white/5"
            >
              <X strokeWidth={1.5} className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-accent bg-accent text-night-950 font-semibold"
          : "border-white/15 text-zinc-300 hover:border-white/35 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
