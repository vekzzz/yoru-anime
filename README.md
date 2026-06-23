# YORU

> *Stream anime the night it airs.*

YORU is a full-stack anime streaming app built as a portfolio/demo project. Real anime data from AniList, cinematic dark UI, native-app feel on mobile.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR, file-based routing) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`, no PostCSS) |
| Animation | GSAP 3 + ScrollTrigger, Lenis smooth scroll |
| 3D / WebGL | Three.js (lazy-loaded, hero particle field) |
| Carousel | Embla Carousel |
| Icons | Lucide React |
| Fonts | Space Grotesk (display), DM Sans (body) — self-hosted via Fontsource |
| Data | AniList GraphQL API (baked to `src/lib/anime.json` at build time) |
| Runtime | Nitro (via TanStack Start) |
| Package manager | pnpm |

---

## Features

### Pages

| Route | Description |
|---|---|
| `/` | Home — hero, continue watching, trending rail, featured showcase, genre bento, testimonials |
| `/browse` | Search + genre filter across the full catalog |
| `/watch/:id` | Series detail — backdrop, poster, episodes grid, related titles |
| `/watch/:id/:ep` | Faux video player — progress tracking, keyboard shortcuts, up-next sidebar |
| `/watchlist` | Saved titles |

### UI / UX

- **Command palette** (`⌘K`) — keyboard-driven search, bottom sheet on mobile with swipe-to-dismiss
- **Trailer modal** — YouTube `youtube-nocookie` embed, auto-plays, Esc to close
- **Continue watching rail** — persists progress per episode across sessions (localStorage)
- **Watchlist** — add/remove, badge count in bottom nav, cross-tab sync
- **Pull-to-refresh** — touch gesture, rubber-band feel, arms only at scroll top
- **Bottom tab bar** — native-app nav on mobile (Home / Browse / Search / My List), safe-area aware
- **Page transitions** — GSAP fade+slide on every route change, respects `prefers-reduced-motion`
- **Image skeleton loading** — pulse placeholder while images load, graceful error state with fallback
- **Newsletter form** — email validation, loading / success / error states, accessible labels

### Player (`/watch/:id/:ep`)

Faux player (no real video — demo only):

- GSAP tween drives the scrubber in real time
- Progress saved every 5% milestone, resumes where you left off
- Volume slider + mute, playback speed (0.5x / 1x / 1.5x / 2x), fullscreen
- Keyboard shortcuts: `Space` play/pause · `← →` ±10s · `↑ ↓` volume · `M` mute · `F` fullscreen
- Guards: shortcuts disabled while command palette or trailer is open

### Motion

- Hero: line-reveal stagger, key-art blurred zoom → float → scroll parallax, magnetic CTA (pointer physics)
- Horizontal pin: `ScrollTrigger` pinned horizontal pan (FeaturedShowcase)
- Scroll reveals: `Reveal` component, stagger on grids
- WebGL particle field: Three.js, lazy-imported, pointer parallax, `prefers-reduced-motion` aware
- Grain overlay: CSS animated noise texture
- Fan reaction marquee: CSS `@keyframes` infinite scroll, pauses on hover

### Performance / Accessibility

- SSR-safe global stores (`useSyncExternalStore`, empty server snapshots)
- Three.js never in SSR bundle (dynamic import inside `useEffect`)
- `prefers-reduced-motion`: GSAP `matchMedia` guards on every tween, CSS `@media` kills all animations globally
- `prefers-reduced-transparency`: solid fallback for `.glass-panel`
- `useIsoLayoutEffect` — `useLayoutEffect` client / `useEffect` server (no SSR warning)
- WCAG AA: labeled inputs, `aria-invalid` + `aria-describedby` on form errors, `aria-pressed` on watchlist toggle, `aria-hidden` on decorative images

---

## Project Structure

```
src/
├── lib/
│   ├── anime.json               # 36 AniList titles (covers, banners, trailers, episodes)
│   ├── site-data.ts             # All exported data (catalog, trending, genres, testimonials…)
│   ├── watchlist.ts             # Watchlist store (useSyncExternalStore + localStorage)
│   ├── progress.ts              # Watch progress store (max 12 entries)
│   ├── overlays.ts              # Command palette + trailer modal state
│   └── use-iso-layout-effect.ts
├── routes/
│   ├── __root.tsx               # Shell: Grain, SmoothScroll, CommandPalette, TrailerModal, PageTransition
│   ├── index.tsx                # Home page + PullToRefresh
│   ├── browse.tsx               # Search/filter
│   ├── watchlist.tsx            # Saved titles
│   ├── watch.$id.tsx            # Series detail
│   └── watch.$id_.$ep.tsx       # Player (trailing _ opts out of layout nesting)
├── components/                  # All UI components
└── styles.css                   # Tailwind v4 @theme tokens + custom utilities
scripts/
└── fetch-anime.mjs              # Refresh anime.json from AniList GraphQL
```

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### Refresh anime data

```bash
node scripts/fetch-anime.mjs
```

Hits the AniList public GraphQL API and rewrites `src/lib/anime.json`. No API key needed.

```bash
pnpm build        # Production SSR build (Nitro output in .output/)
pnpm preview      # Preview the production build locally
```

---

## Design Tokens

Defined in [src/styles.css](src/styles.css) via Tailwind v4 `@theme`:

```css
--color-accent:    #22d3ee   /* cyan-400 — single accent color */
--color-night-950: #08080b
--color-night-900: #0d0d12
--color-night-850: #111118
--color-night-800: #16161f
--font-display:    "Space Grotesk Variable"
--font-sans:       "DM Sans"
```

Custom utilities: `.text-glow`, `.shadow-glow`, `.mask-fade-b`, `.mask-fade-r`, `.no-scrollbar`, `.animate-marquee`, `.glass-panel`, `.reveal-init`

---

## Notes

- **Cover art / stills** are sourced from AniList (studio-copyright). Fine for demo/portfolio — license before any commercial use.
- The player is a faux scrubber — no actual video streams. Intended as UI/UX demonstration.
- AniList data is baked at build time. Run `fetch-anime.mjs` to refresh.
