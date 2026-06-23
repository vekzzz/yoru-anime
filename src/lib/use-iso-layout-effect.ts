import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on the client (runs before paint, so GSAP can set the
// initial hidden state without a flash), useEffect on the server (avoids the
// React SSR warning). GSAP animations should run before paint.
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
