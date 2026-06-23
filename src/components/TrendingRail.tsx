import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trending } from "../lib/site-data";
import { Reveal } from "./Reveal";
import { PosterCard } from "./PosterCard";

export function TrendingRail({ refreshKey = 0 }: { refreshKey?: number }) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [items, setItems] = useState(trending);
  const [prevOk, setPrevOk] = useState(false);
  const [nextOk, setNextOk] = useState(true);

  // Reshuffle when pull-to-refresh bumps the key, then re-measure the carousel.
  useEffect(() => {
    if (refreshKey === 0) return;
    setItems((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, [refreshKey]);

  useEffect(() => {
    embla?.reInit();
  }, [items, embla]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setPrevOk(embla.canScrollPrev());
    setNextOk(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect).on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect).off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  return (
    <section id="browse" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trending tonight
            </h2>
            <p className="mt-3 max-w-md text-zinc-400">
              What everyone is bingeing right now, refreshed every evening.
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <RailButton
              dir="prev"
              disabled={!prevOk}
              onClick={() => embla?.scrollPrev()}
            />
            <RailButton
              dir="next"
              disabled={!nextOk}
              onClick={() => embla?.scrollNext()}
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-10 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-5 lg:px-8">
          {items.map((s) => (
            <PosterCard
              key={s.id}
              series={s}
              className="w-[60%] shrink-0 sm:w-[34%] lg:w-[22%] xl:w-[18%]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RailButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous" : "Next"}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition enabled:hover:border-accent enabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon strokeWidth={1.5} className="h-5 w-5" />
    </button>
  );
}
