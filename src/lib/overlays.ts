import { useSyncExternalStore } from "react";

// Lightweight global stores for the two app-level overlays (command palette and
// trailer modal). Both are SSR-safe: the server snapshot is the closed state.

// ---- Command palette -------------------------------------------------------
let paletteOpen = false;
const paletteListeners = new Set<() => void>();
const emitPalette = () => paletteListeners.forEach((l) => l());

export function setPalette(v: boolean) {
  paletteOpen = v;
  emitPalette();
}
export function togglePalette() {
  paletteOpen = !paletteOpen;
  emitPalette();
}
export function usePalette() {
  return useSyncExternalStore(
    (cb) => {
      paletteListeners.add(cb);
      return () => paletteListeners.delete(cb);
    },
    () => paletteOpen,
    () => false,
  );
}

// ---- Trailer modal ---------------------------------------------------------
export type TrailerState = { id: string; title: string } | null;
let trailer: TrailerState = null;
const trailerListeners = new Set<() => void>();
const emitTrailer = () => trailerListeners.forEach((l) => l());

export function openTrailer(id: string, title: string) {
  trailer = { id, title };
  emitTrailer();
}
export function closeTrailer() {
  trailer = null;
  emitTrailer();
}
export function useTrailer() {
  return useSyncExternalStore(
    (cb) => {
      trailerListeners.add(cb);
      return () => trailerListeners.delete(cb);
    },
    () => trailer,
    () => null,
  );
}
