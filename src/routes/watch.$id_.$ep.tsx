import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { gsap } from "gsap";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronLeft,
} from "lucide-react";
import { getSeriesDetail } from "../lib/site-data";
import { getProgress, recordProgress } from "../lib/progress";
import { usePalette, useTrailer } from "../lib/overlays";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { WatchlistButton } from "../components/WatchlistButton";
import { ImageFade } from "../components/ImageFade";

export const Route = createFileRoute("/watch/$id_/$ep")({ component: Player });

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

function Player() {
  const { id, ep } = Route.useParams();
  const navigate = useNavigate();
  const series = getSeriesDetail(id);
  const epNum = Number(ep);
  const episode = series?.episodes.find((e) => e.n === epNum);

  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef(-1);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isFs, setIsFs] = useState(false);

  // Keyboard shortcuts must yield to the command palette / trailer overlays.
  const paletteOpen = usePalette();
  const trailerOpen = Boolean(useTrailer());

  const runtimeMin = episode ? parseInt(episode.duration, 10) || 24 : 24;
  const totalSec = runtimeMin * 60;

  // Build the faux-playback tween. 1 real second ≈ 1 episode minute, so the
  // progress bar fills in ~runtime seconds. No per-frame React state: the bar
  // width and time label are written straight to the DOM in onUpdate. Progress
  // is persisted (every 5%) so the homepage "Continue watching" rail can resume.
  useEffect(() => {
    const proxy = { value: 0 };
    const tween = gsap.to(proxy, {
      value: 1,
      duration: runtimeMin,
      ease: "none",
      paused: true,
      onUpdate: () => {
        const pct = proxy.value * 100;
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
        if (timeRef.current)
          timeRef.current.textContent = fmt(proxy.value * totalSec);
        const bucket = Math.floor(pct / 5);
        if (bucket !== bucketRef.current) {
          bucketRef.current = bucket;
          recordProgress(id, epNum, pct);
        }
      },
      onComplete: () => {
        setPlaying(false);
        recordProgress(id, epNum, 100);
      },
    });
    tweenRef.current = tween;

    // Resume from any stored position for this exact episode.
    const stored = getProgress(id);
    if (stored && stored.ep === epNum && stored.percent > 0 && stored.percent < 100) {
      tween.progress(stored.percent / 100);
    }

    return () => {
      if (proxy.value > 0 && proxy.value < 1)
        recordProgress(id, epNum, proxy.value * 100);
      tween.kill();
      tweenRef.current = null;
    };
  }, [id, ep, epNum, runtimeMin, totalSec]);

  const toggle = () => {
    const t = tweenRef.current;
    if (!t) return;
    if (t.paused() || t.progress() === 1) {
      if (t.progress() === 1) t.restart();
      else t.play();
      setPlaying(true);
    } else {
      t.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = tweenRef.current;
    if (!t) return;
    const rect = e.currentTarget.getBoundingClientRect();
    t.progress(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };

  const seekBy = (deltaSec: number) => {
    const t = tweenRef.current;
    if (!t) return;
    t.progress(Math.min(1, Math.max(0, t.progress() + deltaSec / totalSec)));
  };

  const applySpeed = (rate: number) => {
    setSpeed(rate);
    setShowSpeed(false);
    tweenRef.current?.timeScale(rate);
  };

  const adjustVolume = (delta: number) =>
    setVolume((v) => Math.min(100, Math.max(0, v + delta)));

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else surfaceRef.current?.requestFullscreen?.();
  };

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Player keyboard shortcuts. Inert while an overlay is open or while typing.
  useEffect(() => {
    if (paletteOpen || trailerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ":
          if (tag === "BUTTON") return; // let the focused button handle it
          e.preventDefault();
          toggle();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekBy(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekBy(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setMuted(false);
          adjustVolume(10);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-10);
          break;
        case "m":
        case "M":
          setMuted((v) => !v);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // toggle/seekBy close over refs + stable setters; totalSec covers ep change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteOpen, trailerOpen, totalSec]);

  if (!series || !episode) {
    return (
      <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
        <Nav />
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
          <h1 className="font-display text-4xl font-bold text-white">
            Episode not found
          </h1>
          <Link
            to="/watch/$id"
            params={{ id }}
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-night-950 hover:bg-accent-bright"
          >
            Back to series
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasPrev = epNum > 1;
  const hasNext = epNum < series.episodes.length;

  return (
    <div className="min-h-[100dvh] bg-night-950 font-sans text-zinc-100">
      <Nav />

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-24 lg:px-8 lg:pt-28">
        <Link
          to="/watch/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ChevronLeft strokeWidth={1.5} className="h-4 w-4" />
          {series.title}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Player + info */}
          <div className="lg:col-span-8">
            <div
              ref={surfaceRef}
              className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black"
            >
              <img
                src={episode.img}
                alt=""
                aria-hidden
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.dataset.fb !== "1") {
                    t.dataset.fb = "1";
                    t.src = series.backdrop;
                  }
                }}
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-night-950/20" />

              {/* Center play/pause */}
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-accent/90 text-night-950 shadow-glow transition-transform duration-200 hover:scale-105">
                  {playing ? (
                    <Pause strokeWidth={2} className="h-8 w-8 fill-night-950" />
                  ) : (
                    <Play strokeWidth={2} className="h-8 w-8 fill-night-950" />
                  )}
                </span>
              </button>

              {/* Control bar */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div
                  onClick={seek}
                  className="group h-1.5 w-full cursor-pointer rounded-full bg-white/20"
                >
                  <div
                    ref={fillRef}
                    className="h-full w-0 rounded-full bg-accent"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggle}
                      aria-label={playing ? "Pause" : "Play"}
                    >
                      {playing ? (
                        <Pause strokeWidth={1.5} className="h-5 w-5" />
                      ) : (
                        <Play strokeWidth={1.5} className="h-5 w-5 fill-white" />
                      )}
                    </button>
                    <div className="group/vol flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMuted((v) => !v)}
                        aria-label={muted ? "Unmute" : "Mute"}
                        className="text-zinc-300 transition-colors hover:text-white"
                      >
                        {muted || volume === 0 ? (
                          <VolumeX strokeWidth={1.5} className="h-5 w-5" />
                        ) : volume < 50 ? (
                          <Volume1 strokeWidth={1.5} className="h-5 w-5" />
                        ) : (
                          <Volume2 strokeWidth={1.5} className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(Number(e.target.value));
                          setMuted(false);
                        }}
                        aria-label="Volume"
                        className="hidden h-1 w-16 cursor-pointer accent-accent sm:block lg:w-20"
                      />
                    </div>
                    <span className="text-xs tabular-nums text-zinc-300">
                      <span ref={timeRef}>0:00</span> / {fmt(totalSec)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-300">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSpeed((s) => !s)}
                        aria-label="Playback speed"
                        className="flex items-center transition-colors hover:text-white"
                      >
                        <Settings strokeWidth={1.5} className="h-5 w-5" />
                      </button>
                      {showSpeed && (
                        <div className="glass-panel absolute bottom-full right-0 mb-3 w-32 rounded-xl border border-white/10 p-1">
                          {[0.5, 1, 1.5, 2].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => applySpeed(r)}
                              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                speed === r
                                  ? "text-accent"
                                  : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              {r === 1 ? "Normal" : `${r}x`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={isFs ? "Exit fullscreen" : "Fullscreen"}
                      className="transition-colors hover:text-white"
                    >
                      {isFs ? (
                        <Minimize strokeWidth={1.5} className="h-5 w-5" />
                      ) : (
                        <Maximize strokeWidth={1.5} className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard shortcut hints */}
            <div className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500 sm:flex">
              <span className="flex items-center gap-1.5">
                <Kbd>Space</Kbd> Play
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>←</Kbd>
                <Kbd>→</Kbd> Seek
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> Volume
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>M</Kbd> Mute
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>F</Kbd> Fullscreen
              </span>
            </div>

            {/* Episode info */}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-medium text-accent">
                  Episode {episode.n} · {episode.duration}
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
                  {episode.title}
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() =>
                    navigate({
                      to: "/watch/$id/$ep",
                      params: { id, ep: String(epNum - 1) },
                    })
                  }
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30"
                  aria-label="Previous episode"
                >
                  <SkipBack strokeWidth={1.5} className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() =>
                    navigate({
                      to: "/watch/$id/$ep",
                      params: { id, ep: String(epNum + 1) },
                    })
                  }
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-30"
                  aria-label="Next episode"
                >
                  <SkipForward strokeWidth={1.5} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
              {series.synopsis}
            </p>

            <div className="mt-6">
              <WatchlistButton id={series.id} />
            </div>
          </div>

          {/* Up next */}
          <aside className="lg:col-span-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Up next
            </h2>
            <ul className="mt-4 flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
              {series.episodes.map((e) => {
                const current = e.n === epNum;
                return (
                  <li key={e.n}>
                    <Link
                      to="/watch/$id/$ep"
                      params={{ id, ep: String(e.n) }}
                      className={`flex gap-3 rounded-xl border p-2 transition active:scale-[0.98] ${
                        current
                          ? "border-accent/50 bg-accent/10"
                          : "border-transparent hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg">
                        <ImageFade
                          src={e.img}
                          alt=""
                          ariaHidden
                          fallback={series.backdrop}
                          className="h-full w-full object-cover transition-opacity duration-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">
                          Ep {e.n} · {e.duration}
                        </p>
                        <p className="truncate font-display text-sm font-medium text-white">
                          {e.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded border border-white/15 px-1 font-sans text-[11px] text-zinc-400">
      {children}
    </kbd>
  );
}
