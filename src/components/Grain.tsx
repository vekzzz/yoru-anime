// Fixed film-grain overlay for the cinematic feel. Fixed + pointer-events-none
// so it never triggers GPU repaints on scroll (Section 6.E). Static SVG noise.
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-screen"
      style={{ backgroundImage: `url("${NOISE}")` }}
    />
  );
}
