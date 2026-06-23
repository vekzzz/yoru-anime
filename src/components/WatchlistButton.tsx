import { Check, Plus } from "lucide-react";
import { useWatchlist } from "../lib/watchlist";

export function WatchlistButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const { has, toggle } = useWatchlist();
  const added = has(id);

  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={() => toggle(id)}
      className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-medium transition-colors ${
        added
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-white/20 text-white hover:border-white/45 hover:bg-white/5"
      } ${className}`}
    >
      {added ? (
        <Check strokeWidth={2} className="h-5 w-5" />
      ) : (
        <Plus strokeWidth={1.5} className="h-5 w-5" />
      )}
      {added ? "On your list" : "Add to list"}
    </button>
  );
}
