import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, Bookmark } from "lucide-react";
import { setPalette } from "../lib/overlays";
import { useWatchlist } from "../lib/watchlist";

// Native-app-style bottom tab bar for mobile. Frosted glass, safe-area aware,
// hidden from `lg` up (desktop keeps the top nav). z-40 sits below the palette
// and trailer overlays (z-80).
export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useWatchlist();

  const cls = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition active:scale-90 ${
      active ? "text-accent" : "text-zinc-400"
    }`;

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <Link to="/" className={cls(path === "/")}>
        <Home strokeWidth={1.5} className="h-5 w-5" />
        Home
      </Link>
      <Link to="/browse" className={cls(path.startsWith("/browse"))}>
        <LayoutGrid strokeWidth={1.5} className="h-5 w-5" />
        Browse
      </Link>
      <button type="button" onClick={() => setPalette(true)} className={cls(false)}>
        <Search strokeWidth={1.5} className="h-5 w-5" />
        Search
      </button>
      <Link to="/watchlist" className={cls(path === "/watchlist")}>
        <span className="relative">
          <Bookmark strokeWidth={1.5} className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-night-950">
              {count}
            </span>
          )}
        </span>
        My List
      </Link>
    </nav>
  );
}
