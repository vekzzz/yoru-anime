import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Star, ChevronLeft, Film } from "lucide-react";
import { getRelated, getSeriesDetail } from "../lib/site-data";
import { openTrailer } from "../lib/overlays";
import { useIsoLayoutEffect } from "../lib/use-iso-layout-effect";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { PosterCard } from "../components/PosterCard";
import { WatchlistButton } from "../components/WatchlistButton";
import { ImageFade } from "../components/ImageFade";

export const Route = createFileRoute("/watch/$id")({ component: Watch });

function Watch() {
  const { id } = Route.useParams();
  const series = getSeriesDetail(id);
  const backdropRef = useRef<HTMLImageElement>(null);

  // Slow backdrop parallax on scroll (desktop + motion only).
  useIsoLayoutEffect(() => {
    const el = backdropRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { scale: 1.12, yPercent: -4 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
    return () => mm.revert();
  }, [id]);

  if (!series) {
    return (
      <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
        <Nav />
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
            404
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-white">
            We couldn&apos;t find that title
          </h1>
          <p className="mt-3 text-zinc-400">
            It may have left the catalog, or the link is off.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-night-950 transition-transform hover:bg-accent-bright active:scale-[0.97]"
          >
            Back to browse
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = getRelated(series.id);

  return (
    <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
      <Nav />

      {/* Backdrop hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* TODO: real art — wide cinematic backdrop */}
          <img
            ref={backdropRef}
            src={series.backdrop}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/80 to-night-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/40 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-44">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ChevronLeft strokeWidth={1.5} className="h-4 w-4" />
            Browse
          </Link>

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end">
            {/* Poster */}
            <div className="hidden w-52 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-glow sm:block">
              {/* TODO: real art — poster */}
              <img
                src={series.img}
                alt={`${series.title} poster`}
                className="aspect-[2/3] w-full object-cover"
              />
            </div>

            {/* Title block */}
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {series.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] tracking-tight text-white lg:text-7xl">
                {series.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-1.5 font-medium text-white">
                  <Star strokeWidth={1.5} className="h-4 w-4 fill-accent text-accent" />
                  {series.score}
                </span>
                <span>{series.year}</span>
                <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs text-zinc-300">
                  {series.rating}
                </span>
                <span>{series.seasonLabel}</span>
                <span className="text-zinc-500">{series.studio}</span>
              </div>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300">
                {series.synopsis}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/watch/$id/$ep"
                  params={{ id: series.id, ep: "1" }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-night-950 shadow-glow transition-transform duration-200 hover:bg-accent-bright active:scale-[0.97] sm:w-auto"
                >
                  <Play strokeWidth={2} className="h-5 w-5 fill-night-950" />
                  Play E1
                </Link>
                {series.trailerId && (
                  <button
                    type="button"
                    onClick={() => openTrailer(series.trailerId!, series.title)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-medium text-white transition-colors hover:border-white/45 hover:bg-white/5 sm:w-auto"
                  >
                    <Film strokeWidth={1.5} className="h-5 w-5" />
                    Trailer
                  </button>
                )}
                <WatchlistButton
                  id={series.id}
                  className="w-full justify-center sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Episodes */}
      <section id="episodes" className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Episodes
            </h2>
            <span className="text-sm text-zinc-500">{series.seasonLabel}</span>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series.episodes.map((ep, i) => (
              <Reveal key={ep.n} delay={(i % 3) * 0.06}>
                <Link
                  to="/watch/$id/$ep"
                  params={{ id: series.id, ep: String(ep.n) }}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-night-900 transition-[transform,border-color] duration-200 hover:border-white/20 active:scale-[0.98]"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <ImageFade
                      src={ep.img}
                      alt={`${series.title} episode ${ep.n}`}
                      fallback={series.backdrop}
                      className="h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 to-transparent" />
                    <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-accent text-night-950 opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <Play strokeWidth={2} className="h-5 w-5 fill-night-950" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-display font-medium text-accent">
                        Episode {ep.n}
                      </span>
                      <span>{ep.duration}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-white">
                      {ep.title}
                    </h3>
                    {ep.synopsis && (
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {ep.synopsis}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* More like this */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              More like this
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((s) => (
              <PosterCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
