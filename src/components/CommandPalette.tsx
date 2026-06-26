import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, CornerDownLeft, Sparkles } from "lucide-react";
import { catalog, trending } from "../lib/site-data";
import { setPalette, togglePalette, usePalette } from "../lib/overlays";
import { openAgent } from "../lib/agent/store";

// Cmd/Ctrl-K command palette. Frosted-glass panel, fully keyboard driven
// (arrows to move, Enter to open, Esc to close). Always mounted so it can
// transition in/out; body scroll locks only while open.
export function CommandPalette() {
  const open = usePalette();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragY = useRef(0);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return trending.slice(0, 6);
    return catalog
      .filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.genre.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [q]);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      } else if (e.key === "Escape") {
        setPalette(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // On open: reset, focus, lock scroll.
  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const go = (id: string) => {
    setPalette(false);
    navigate({ to: "/watch/$id", params: { id } });
  };

  const askAgent = (query?: string) => {
    setPalette(false);
    openAgent((query ?? q.trim()) || undefined);
  };

  // Swipe the bottom sheet down to dismiss (mobile).
  const onHandleStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientY;
    dragY.current = 0;
  };
  const onHandleMove = (e: React.TouchEvent) => {
    if (dragStart.current === null || !panelRef.current) return;
    dragY.current = Math.max(0, e.touches[0].clientY - dragStart.current);
    panelRef.current.style.transform = `translateY(${dragY.current}px)`;
  };
  const onHandleEnd = () => {
    if (dragStart.current === null) return;
    if (panelRef.current) panelRef.current.style.transform = "";
    if (dragY.current > 80) setPalette(false);
    dragStart.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active === -1) {
        askAgent();
      } else {
        const r = results[active];
        if (r) go(r.id);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-end justify-center transition-opacity duration-200 sm:items-start sm:px-4 sm:pt-[12vh] ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={() => setPalette(false)}
        className="absolute inset-0 cursor-default bg-night-950/70"
      />

      {/* Panel: bottom sheet on mobile, centered modal on desktop */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search anime"
        onKeyDown={onKeyDown}
        className={`glass-panel relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 transition-transform duration-300 ease-out sm:max-h-none sm:max-w-xl sm:rounded-2xl sm:duration-200 ${
          open
            ? "translate-y-0 sm:scale-100"
            : "translate-y-full sm:-translate-y-2 sm:scale-[0.98]"
        }`}
      >
        {/* Drag handle (swipe down to dismiss on mobile) */}
        <div
          onTouchStart={onHandleStart}
          onTouchMove={onHandleMove}
          onTouchEnd={onHandleEnd}
          className="flex shrink-0 cursor-grab justify-center py-2.5 sm:hidden"
        >
          <span className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center gap-3 border-b border-white/10 px-5">
          <Search strokeWidth={1.5} className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anime, genres…"
            className="w-full bg-transparent py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-zinc-500 sm:block">
            Esc
          </kbd>
        </div>

        <ul className="max-h-[52vh] overflow-y-auto p-2">
          {/* Ask YORU agent entry — always shown, but highlighted when query has no catalog match */}
          <li>
            <button
              type="button"
              onMouseEnter={() => setActive(-1)}
              onClick={() => askAgent()}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
                active === -1 ? "bg-accent/15" : "hover:bg-white/5"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15">
                <Sparkles strokeWidth={1.5} className="h-4 w-4 text-accent" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-semibold text-white">
                  {q.trim() ? `Ask: "${q.trim()}"` : "Ask YORU Assistant"}
                </span>
                <span className="block text-xs text-zinc-500">
                  Recommendations, info, and app control
                </span>
              </span>
              {active === -1 && (
                <CornerDownLeft strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" />
              )}
            </button>
          </li>

          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-zinc-500">
              No titles match "{q}" — try asking the assistant above.
            </li>
          ) : (
            results.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(s.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
                    active === i ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <img
                    src={s.img}
                    alt=""
                    aria-hidden
                    className="h-12 w-9 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold text-white">
                      {s.title}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {s.genre} · {s.year}
                    </span>
                  </span>
                  {active === i && (
                    <CornerDownLeft
                      strokeWidth={1.5}
                      className="h-4 w-4 shrink-0 text-accent"
                    />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-white/10 px-5 py-2.5 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded border border-white/15 px-1 text-[11px] text-zinc-400">
      {children}
    </kbd>
  );
}
