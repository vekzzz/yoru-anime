import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { catalog, fanReactions, testimonials } from "../lib/site-data";
import type { Testimonial } from "../lib/site-data";
import { Reveal } from "./Reveal";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Avatar({ name, location, avatar }: Testimonial) {
  const [failed, setFailed] = useState(false);
  return (
    <figcaption className="flex items-center gap-3">
      {failed ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 font-display text-sm font-semibold text-accent">
          {initials(name)}
        </span>
      ) : (
        <img
          src={avatar}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/15"
        />
      )}
      <span className="text-sm">
        <span className="block font-medium text-white">{name}</span>
        <span className="block text-zinc-500">{location}</span>
      </span>
    </figcaption>
  );
}

function SeriesTag({ id }: { id: string }) {
  const series = catalog.find((s) => s.id === id);
  if (!series) return null;
  return (
    <Link
      to="/watch/$id"
      params={{ id }}
      className="group/tag inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs text-zinc-400 transition-colors hover:border-accent/40 hover:text-white"
    >
      <img
        src={series.img}
        alt=""
        aria-hidden
        className="h-6 w-6 rounded-full object-cover"
      />
      <span>
        Watching <span className="text-zinc-200">{series.title}</span>
      </span>
    </Link>
  );
}

// Asymmetric social proof: heading + rating on the left, one hero pull-quote
// and two supporting quotes on the right, then an edge-to-edge marquee of
// short fan reactions. Each quote ties to the series the fan is watching.
export function Testimonials() {
  const [lead, ...rest] = testimonials;

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 lg:grid-cols-12 lg:gap-12 lg:px-8">
        {/* Heading + rating */}
        <div className="lg:col-span-4">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Loved by night owls
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-zinc-400">
              Two million people end their day here. A few of them had
              something to say about it.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    strokeWidth={0}
                    className="h-5 w-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <span className="font-display text-2xl font-bold text-white">
                4.8
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Average rating across 2M+ downloads
            </p>
          </Reveal>
        </div>

        {/* Quotes */}
        <div className="grid grid-cols-1 gap-5 lg:col-span-8 lg:grid-cols-2">
          {/* Hero quote */}
          <Reveal className="lg:col-span-2">
            <figure className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-night-900 p-8 lg:p-10">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-4 left-6 font-display text-[7rem] leading-none text-accent/15"
              >
                &ldquo;
              </span>
              <blockquote className="relative font-display text-2xl font-medium leading-snug text-white lg:text-3xl">
                {lead.quote}
              </blockquote>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <Avatar {...lead} />
                <SeriesTag id={lead.seriesId} />
              </div>
            </figure>
          </Reveal>

          {/* Supporting quotes */}
          {rest.map((t, i) => (
            <Reveal key={t.name} delay={0.08 + i * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-night-900 p-7 transition-colors hover:border-white/20">
                <blockquote className="font-display text-lg font-medium leading-snug text-zinc-100">
                  {t.quote}
                </blockquote>
                <div className="mt-7 flex flex-col gap-4">
                  <SeriesTag id={t.seriesId} />
                  <Avatar {...t} />
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Fan reaction marquee (the page's single marquee) */}
      <div className="marquee-mask marquee-pause group relative mt-14 flex overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {[...fanReactions, ...fanReactions].map((r, i) => (
            <span
              key={i}
              className="whitespace-nowrap rounded-full border border-white/10 bg-night-900 px-5 py-2.5 text-sm text-zinc-400"
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
