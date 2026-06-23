import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play, ArrowRight } from "lucide-react";
import { useIsoLayoutEffect } from "../lib/use-iso-layout-effect";
import { heroSpotlight } from "../lib/site-data";
import { openTrailer } from "../lib/overlays";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const magnetRef = useRef<HTMLAnchorElement>(null);

  useIsoLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;

    // Reduced motion: leave everything at its natural, fully-visible position.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Intro: headline lines wipe up from behind their masks, the rest fades
      // up, the key-art resolves from a blurred zoom.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-line]",
          { yPercent: 120 },
          { yPercent: 0, duration: 1, stagger: 0.12 },
          0.15,
        )
        .fromTo(
          "[data-hero]",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
          0.5,
        )
        .fromTo(
          artRef.current,
          { opacity: 0, scale: 1.08, filter: "blur(14px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2 },
          0.2,
        );

      // Continuous, very subtle float on the key-art.
      gsap.to(artRef.current, {
        y: -14,
        duration: 3.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Scroll parallax: art drifts down, copy drifts up, as the hero leaves.
      gsap.to(artRef.current, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to("[data-hero-copy]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    // Magnetic primary CTA (fine pointers only — never on touch).
    const magnet = magnetRef.current;
    let cleanupMagnet = () => {};
    if (magnet && window.matchMedia("(pointer: fine)").matches) {
      const xTo = gsap.quickTo(magnet, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(magnet, "y", { duration: 0.4, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = magnet.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.4);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.5);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      magnet.addEventListener("pointermove", move);
      magnet.addEventListener("pointerleave", leave);
      cleanupMagnet = () => {
        magnet.removeEventListener("pointermove", move);
        magnet.removeEventListener("pointerleave", leave);
      };
    }

    return () => {
      ctx.revert();
      cleanupMagnet();
    };
  }, []);

  return (
    <section
      id="top"
      ref={scope}
      className="relative min-h-[100dvh] overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-20 bg-night-950" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 8%, rgba(34,211,238,0.20), transparent 55%), radial-gradient(80% 70% at 12% 100%, rgba(14,116,144,0.18), transparent 60%)",
        }}
      />
      <HeroBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_40%,rgba(8,8,11,0.8)_100%)]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-12 px-5 pt-24 pb-16 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Copy */}
        <div data-hero-copy className="lg:col-span-7">
          <p
            data-hero
            className="font-display text-[11px] font-medium uppercase tracking-[0.32em] text-accent"
          >
            Anime, the night it airs
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight text-white sm:mt-6 sm:text-6xl sm:leading-[1.0] lg:text-7xl">
            <span className="block overflow-hidden pb-1.5">
              <span data-line className="block">
                Stay up too late.
              </span>
            </span>
            <span className="block overflow-hidden pb-1.5">
              <span data-line className="block text-accent text-glow">
                On purpose.
              </span>
            </span>
          </h1>

          <p
            data-hero
            className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-400"
          >
            Thousands of series, simulcast from Japan within the hour. Subbed,
            dubbed, and ready the moment you are.
          </p>

          <div
            data-hero
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <a
              ref={magnetRef}
              href="#start"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-night-950 shadow-glow transition-colors duration-200 hover:bg-accent-bright sm:w-auto"
            >
              <Play strokeWidth={2} className="h-5 w-5 fill-night-950" />
              Start watching
            </a>
            <Link
              to="/browse"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-base font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:w-auto"
            >
              Browse catalog
              <ArrowRight
                strokeWidth={1.5}
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Key-art */}
        <div className="lg:col-span-5">
          <div
            ref={artRef}
            className="relative mx-auto aspect-[3/4] w-full max-w-[15rem] sm:max-w-sm"
          >
            {/* Offset back card for depth (desktop only, cleaner on mobile) */}
            <div className="absolute -right-4 top-6 hidden h-full w-full -rotate-3 overflow-hidden rounded-3xl border border-white/5 opacity-60 sm:block">
              <img
                src={heroSpotlight.posterBack}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            {/* Front card */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/10 shadow-glow">
              <img
                src={heroSpotlight.poster}
                alt={`${heroSpotlight.title} key art`}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/85 via-transparent to-transparent" />
              <button
                type="button"
                aria-label={`Play ${heroSpotlight.title} trailer`}
                disabled={!heroSpotlight.trailerId}
                onClick={() =>
                  heroSpotlight.trailerId &&
                  openTrailer(heroSpotlight.trailerId, heroSpotlight.title)
                }
                className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-night-950/40 backdrop-blur-md transition-transform duration-200 hover:scale-105 disabled:opacity-60"
              >
                <Play strokeWidth={1.5} className="h-6 w-6 fill-white text-white" />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-xl font-semibold text-white">
                  {heroSpotlight.title}
                </p>
                <p className="mt-1 text-sm text-zinc-300">{heroSpotlight.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
