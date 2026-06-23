import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, Plus } from "lucide-react";
import { featured } from "../lib/site-data";
import { useIsoLayoutEffect } from "../lib/use-iso-layout-effect";
import { Reveal } from "./Reveal";

// Pinned horizontal scroll-hijack (Section 5.B). The reason this earns a pin:
// it turns the season's tentpole titles into a cinematic, full-bleed reel the
// viewer walks through one frame at a time. Desktop + motion only — on mobile
// or under reduced motion the same slides stack vertically with native scroll.
export function FeaturedShowcase() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (!wrap.current || !track.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const distance = () =>
          track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section id="season" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            This season&apos;s heavy hitters
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            Three you should not let pile up in your watchlist.
          </p>
        </Reveal>
      </div>

      <div ref={wrap} className="relative mt-12 lg:mt-16 lg:overflow-hidden">
        <div
          ref={track}
          className="flex flex-col gap-6 px-5 lg:h-[100dvh] lg:flex-row lg:gap-0 lg:px-0"
        >
          {featured.map((f) => (
            <article
              key={f.id}
              className="relative flex h-[70vh] w-full shrink-0 items-end overflow-hidden rounded-3xl border border-white/10 lg:h-full lg:w-[78vw] lg:rounded-none lg:border-0 lg:border-r lg:border-white/10"
            >
              {/* TODO: real art — cinematic still, 16:9 */}
              <img
                src={f.img}
                alt={`${f.title} still`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-night-950/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-night-950/80 via-transparent to-transparent" />

              <div className="relative z-10 max-w-xl p-8 lg:p-16">
                <p className="font-display text-sm font-medium text-accent">
                  {f.genre}
                </p>
                <h3 className="mt-3 font-display text-4xl font-bold leading-tight text-white lg:text-6xl">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{f.episodes}</p>
                <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-300">
                  {f.blurb}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#start"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night-950 transition-transform duration-200 hover:bg-accent-bright active:scale-[0.97]"
                  >
                    <Play strokeWidth={2} className="h-4 w-4 fill-night-950" />
                    Watch now
                  </a>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/45 hover:bg-white/5"
                  >
                    <Plus strokeWidth={1.5} className="h-4 w-4" />
                    Add to list
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
