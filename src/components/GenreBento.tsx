import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { genres } from "../lib/site-data";
import { Reveal } from "./Reveal";
import { ImageFade } from "./ImageFade";

// Bento grid with real imagery in every cell (Section 4.7 background diversity).
// 7 items → 7 cells, sized for rhythm, no empty tiles.
export function GenreBento() {
  return (
    <section id="genres" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find your vibe
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            However you got into anime, there is a corner of the catalog with
            your name on it.
          </p>
        </Reveal>

        <Reveal
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[190px]"
          y={40}
        >
          {genres.map((g) => (
            <Link
              key={g.name}
              to="/browse"
              search={{ genre: g.name }}
              className={`group relative flex h-44 items-end overflow-hidden rounded-2xl border border-white/10 transition-transform duration-200 active:scale-[0.98] md:h-auto ${g.span}`}
            >
              <ImageFade
                src={g.img}
                alt=""
                ariaHidden
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent transition-colors group-hover:from-night-950" />
              <div className="relative z-10 flex w-full items-end justify-between p-5">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {g.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">{g.count}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 translate-y-1 place-items-center rounded-full border border-white/20 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight strokeWidth={1.5} className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
