import { useSyncExternalStore } from "react";

// Tiny external store for the watchlist, persisted to localStorage and shared
// across every component via useSyncExternalStore. SSR-safe: the server (and
// the first client render) sees an empty list, then it hydrates from storage
// after mount — so there is no hydration mismatch.

const KEY = "yoru:watchlist";

let ids: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const serverSnapshot: string[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) ids = JSON.parse(raw);
  } catch {
    ids = [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage full or unavailable — keep in-memory only */
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  // First subscriber triggers the storage load (post-hydration).
  if (!loaded) {
    load();
    if (ids.length) queueMicrotask(emit);
  }
  listeners.add(cb);
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      try {
        ids = e.newValue ? JSON.parse(e.newValue) : [];
      } catch {
        ids = [];
      }
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleWatchlist(id: string) {
  load();
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
  persist();
  emit();
}

export function isInWatchlist(id: string) {
  return ids.includes(id);
}

export function useWatchlist() {
  const list = useSyncExternalStore(
    subscribe,
    () => ids,
    () => serverSnapshot,
  );
  return {
    ids: list,
    count: list.length,
    has: (id: string) => list.includes(id),
    toggle: toggleWatchlist,
  };
}
