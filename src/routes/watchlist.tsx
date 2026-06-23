import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { catalog } from "../lib/site-data";
import { useWatchlist } from "../lib/watchlist";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { PosterCard } from "../components/PosterCard";

export const Route = createFileRoute("/watchlist")({ component: Watchlist });

function Watchlist() {
  const { ids, count } = useWatchlist();
  // The list lives in localStorage, so it is only known after mount. Gate the
  // first paint to avoid flashing the empty state before hydration loads it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = ids
    .map((id) => catalog.find((s) => s.id === id))
    .filter((s): s is (typeof catalog)[number] => Boolean(s));

  return (
    <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
      <Nav />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8 lg:pt-40">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white lg:text-6xl">
          My list
        </h1>
        <p className="mt-3 text-zinc-400">
          {mounted
            ? count > 0
              ? `${count} ${count === 1 ? "series" : "series"} saved to watch later.`
              : "Everything you save lives here, on this device."
            : " "}
        </p>

        {!mounted ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] animate-pulse rounded-2xl border border-white/5 bg-night-900"
              />
            ))}
          </div>
        ) : saved.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {saved.map((s) => (
              <PosterCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-start gap-5 rounded-3xl border border-white/10 bg-night-900 p-10">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/10 text-accent">
              <Bookmark strokeWidth={1.5} className="h-7 w-7" />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-white">
                Your list is empty
              </p>
              <p className="mt-2 max-w-md text-zinc-400">
                Tap Add to list on any series and it shows up here, ready for
                tonight.
              </p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-night-950 transition-transform hover:bg-accent-bright active:scale-[0.97]"
            >
              Browse anime
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
