import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { Series } from "../lib/site-data";
import { ImageFade } from "./ImageFade";

export function PosterCard({
  series,
  className = "",
}: {
  series: Series;
  className?: string;
}) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: series.id }}
      className={`group relative block transition-transform duration-150 active:scale-[0.97] ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-night-850">
        <ImageFade
          src={series.img}
          alt={`${series.title} poster`}
          className="h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/10 to-transparent" />
        <div className="absolute inset-0 opacity-0 ring-1 ring-inset ring-accent/0 transition group-hover:opacity-100 group-hover:ring-accent/60" />
        <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-accent text-night-950 opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
          <Play strokeWidth={2} className="h-5 w-5 fill-night-950" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-base font-semibold leading-tight text-white">
            {series.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            {series.genre} · {series.year}
          </p>
        </div>
      </div>
    </Link>
  );
}
