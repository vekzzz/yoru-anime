import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Search } from "lucide-react";
import { brand, nav } from "../lib/site-data";
import { useWatchlist } from "../lib/watchlist";
import { setPalette } from "../lib/overlays";
import { BottomNav } from "./BottomNav";

function Mark() {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <defs>
          <mask id="crescent">
            <rect width="32" height="32" fill="#fff" />
            <circle cx="21" cy="14" r="11" fill="#000" />
          </mask>
        </defs>
        <circle cx="15" cy="16" r="12" fill="var(--color-accent)" mask="url(#crescent)" />
      </svg>
    </span>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const { count } = useWatchlist();

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="absolute top-0 h-px w-full" aria-hidden />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-night-950/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white"
          >
            <Mark />
            {brand.name}
          </Link>

          {/* Desktop section links */}
          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop actions (mobile uses the bottom tab bar instead) */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 py-2 pl-3.5 pr-2.5 text-sm text-zinc-400 transition hover:border-white/25 hover:text-white"
            >
              <Search strokeWidth={1.5} className="h-4 w-4" />
              <span>Search</span>
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-zinc-500">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/watchlist"
              aria-label={`Watchlist${count ? `, ${count} saved` : ""}`}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-white/25 hover:text-white"
            >
              <Bookmark strokeWidth={1.5} className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-night-950">
                  {count}
                </span>
              )}
            </Link>
            <a
              href="/#start"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-night-950 transition-transform duration-200 hover:bg-accent-bright active:scale-[0.97]"
            >
              Start watching
            </a>
          </div>

          {/* Mobile search shortcut (primary nav lives in the bottom bar) */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setPalette(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-white/25 hover:text-white lg:hidden"
          >
            <Search strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </nav>
      </header>

      <BottomNav />
    </>
  );
}
