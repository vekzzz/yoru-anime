import { useEffect } from "react";
import { X } from "lucide-react";
import { closeTrailer, useTrailer } from "../lib/overlays";

// Trailer lightbox. Embeds the real YouTube trailer; unmounts when closed so
// playback (and audio) actually stops. Esc and backdrop click both close.
export function TrailerModal() {
  const trailer = useTrailer();

  useEffect(() => {
    if (!trailer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTrailer();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [trailer]);

  if (!trailer) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close trailer"
        onClick={closeTrailer}
        className="absolute inset-0 cursor-default bg-night-950/85 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="truncate font-display text-lg font-semibold text-white">
            {trailer.title}
            <span className="ml-2 font-sans text-sm font-normal text-zinc-500">
              Official trailer
            </span>
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeTrailer}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-white/40 hover:bg-white/5"
          >
            <X strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glow">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.id}?autoplay=1&rel=0`}
            title={`${trailer.title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
