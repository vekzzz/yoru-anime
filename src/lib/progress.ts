import { useSyncExternalStore } from "react";

// Persisted "continue watching" store. The player writes playback progress
// here; the homepage rail reads it. Same SSR-safe pattern as the watchlist:
// server (and first client render) sees an empty list, then it hydrates from
// localStorage after mount.

const KEY = "yoru:progress";
const MAX = 12;

export type Progress = { id: string; ep: number; percent: number; ts: number };

let entries: Progress[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const serverSnapshot: Progress[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) entries = JSON.parse(raw);
  } catch {
    entries = [];
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!loaded) {
    queueMicrotask(() => {
      load();
      if (entries.length) emit();
    });
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      try {
        entries = e.newValue ? JSON.parse(e.newValue) : [];
      } catch {
        entries = [];
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

export function recordProgress(id: string, ep: number, percent: number) {
  load();
  const next: Progress = {
    id,
    ep,
    percent: Math.round(Math.min(100, Math.max(0, percent))),
    ts: Date.now(),
  };
  // Most-recent first; one entry per series.
  entries = [next, ...entries.filter((e) => e.id !== id)].slice(0, MAX);
  persist();
  emit();
}

export function removeProgress(id: string) {
  load();
  entries = entries.filter((e) => e.id !== id);
  persist();
  emit();
}

export function getProgress(id: string): Progress | undefined {
  load();
  return entries.find((e) => e.id === id);
}

export function useContinueWatching() {
  const items = useSyncExternalStore(
    subscribe,
    () => entries,
    () => serverSnapshot,
  );
  return { items, count: items.length };
}
