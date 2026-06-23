import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { usePalette, useTrailer } from "../lib/overlays";

// Mobile pull-to-refresh. Uses touch events (not a scroll listener) and writes
// the pull distance straight to the indicator's transform, so there is no
// per-frame React state. Only arms at the top of the page and on touch devices;
// inert while an overlay is open.
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dist = useRef(0);
  const pulling = useRef(false);
  const paletteOpen = usePalette();
  const trailerOpen = Boolean(useTrailer());

  useEffect(() => {
    const THRESHOLD = 70;

    const setIndicator = (d: number) => {
      const el = indicatorRef.current;
      if (!el) return;
      el.style.transform = `translateY(${d}px)`;
      el.style.opacity = d > 4 ? "1" : "0";
    };

    const onStart = (e: TouchEvent) => {
      if (paletteOpen || trailerOpen || refreshing) return;
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      dist.current = 0;
      pulling.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        pulling.current = false;
        setIndicator(0);
        return;
      }
      // Rubber-band resistance.
      dist.current = Math.min(delta * 0.5, 96);
      setIndicator(dist.current);
      e.preventDefault();
    };

    const onEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (dist.current >= THRESHOLD) {
        setRefreshing(true);
        setIndicator(THRESHOLD);
        await onRefresh();
        setRefreshing(false);
      }
      setIndicator(0);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [onRefresh, refreshing, paletteOpen, trailerOpen]);

  return (
    <>
      <div
        ref={indicatorRef}
        className="pointer-events-none fixed inset-x-0 top-2 z-40 flex justify-center opacity-0 transition-[opacity] duration-150 lg:hidden"
        aria-hidden
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-night-900 text-accent shadow-glow">
          <Loader2
            strokeWidth={2}
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </span>
      </div>
      {children}
    </>
  );
}
