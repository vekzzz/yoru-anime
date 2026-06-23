import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import { getSeriesDetail } from "../lib/site-data";
import { removeProgress, useContinueWatching } from "../lib/progress";
import { ImageFade } from "./ImageFade";

// Personalized "Continue watching" rail. Data lives in localStorage, so it is
// client-only: nothing renders on the server or before mount, and the whole
// section disappears when there is nothing in progress.
export function ContinueWatching() {
  const { items } = useContinueWatching();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  return (
    <section className="relative py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Continue watching
        </h2>
      </div>

      <div className="no-scrollbar mt-7 overflow-x-auto">
        <div className="flex snap-x gap-4 px-5 lg:px-8">
          {items.map((p) => {
            const series = getSeriesDetail(p.id);
            if (!series) return null;
            const ep =
              series.episodes.find((e) => e.n === p.ep) ?? series.episodes[0];
            if (!ep) return null;

            return (
              <div
                key={p.id}
                className="group relative w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23%]"
              >
                <Link
                  to="/watch/$id/$ep"
                  params={{ id: p.id, ep: String(ep.n) }}
                  className="block transition-transform duration-150 active:scale-[0.97]"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-night-850">
                    <ImageFade
                      src={ep.img}
                      alt={`${series.title} episode ${ep.n}`}
                      fallback={series.backdrop}
                      className="h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent" />
                    <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-accent text-night-950 opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <Play strokeWidth={2} className="h-5 w-5 fill-night-950" />
                    </div>
                    {/* Progress bar */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="truncate font-display text-sm font-semibold text-white">
                      {series.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Episode {ep.n} · {p.percent}% watched
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  aria-label={`Remove ${series.title} from continue watching`}
                  onClick={() => removeProgress(p.id)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-night-950/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-night-950 group-hover:opacity-100"
                >
                  <X strokeWidth={1.5} className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
