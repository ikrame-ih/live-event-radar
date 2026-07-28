# Technical decisions

Notes on why the app is built this way — and a few real problems I ran into while building it. For structured problem → options → choice → trade-off writeups, see [Engineering decisions — design trade-offs and rationale](/engineering-decisions).

## Why this problem

I worked brand activations as a hostess. Stock issues always showed up late — usually through WhatsApp, never through a live picture of the venue. LiveEvent Radar is my frontend answer to that: a Command Center that _feels_ like an ops dashboard, even when the data feed is simulated locally.

## Stack choices

| Choice                        | Why                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router)**   | File-based routes and shared layouts make the shell architecture simple. `(main)/layout.tsx` keeps the header and background mounted while only the page content swaps on navigation. |
| **TypeScript**                | The `StockEvent` type and store shapes are explicit. Adding a real API later means no guesswork about what fields the server sends.                                                   |
| **Zustand**                   | One `telemetry-store` shared by both routes. Much less setup than Redux for a buffer and a few computed values.                                                                       |
| **React SVG + Leaflet**       | Hand-drawn SVG schematic on `/` for stock heat at a glance. Leaflet on `/dashboard` for geographic context. I skipped Chart.js — the maps already encode the data.                    |
| **Vitest + Playwright**       | Vitest for stock math and parsers. Playwright for both routes across desktop, tablet, and phone.                                                                                      |
| **VitePress on GitHub Pages** | Publish the case study without sharing my full private notes.                                                                                                                         |

## Challenges and how I solved them

### Layout jump when KPI numbers changed

Proportional web fonts make digit widths vary — "1" is narrower than "8", so live counters shift adjacent labels. I applied `font-variant-numeric: tabular-nums` via `.bry-metric` (and Tailwind `tabular-nums`) to every live metric: KPI hero, gauge, zone cards, activity rows, stream rows. Heading/UI roles are split in CSS (`--font-heading`, `--font-ui`, `--font-metric`) so section titles and digits stay consistent across `/` and `/dashboard`.

### Animating the buffer count without spamming React

Storing animation progress in React state would re-render ~60 times per second for a purely visual tick. For **Events received** I animate with `requestAnimationFrame` and write to a DOM ref instead. React still owns the value; only the display layer runs outside the render cycle.

### Route change flash

Navigating between `/` and `/dashboard` used to remount everything including background and header. I moved both routes under `app/(main)/`, shared `AppShell`, and wired `TransitionLink` to the View Transitions API (~180ms crossfade). Header and background stay put. The nav dock is **two icons** (Command Center · Live dashboard) — a third map-hash link duplicated what each page already shows.

### Stock-events list stretching the map

On `/dashboard` the event feed can be hundreds of rows. The feed list is locked to a fixed `20rem` height (~5 dense rows) with `overflow-y: scroll`. The map | stock-events split uses `align-items: stretch` so both cards share the same height (bottoms aligned); the Leaflet pane fills the extra space via `invalidateSize` on resize.

### One ingestion path for mock and live data

Mock simulator and WebSocket both call `appendEvent()`. `parseStockEvent` guards malformed JSON frames. The UI shows **Simulator**, **Connecting**, **Live**, or **Offline** from env vars and socket state — same components either way.

### Web Worker scope

The worker runs windowed throughput / hotspot math on a **short sample** of recent events (not the whole buffer), with ~250ms debounce. Pure logic lives in `computeZoneThroughput` so Vitest can cover it without Worker APIs. ETA and session tally stay on the main thread — they are cheap and tied to what the UI renders. Details: [Engineering decisions — design trade-offs and rationale](/engineering-decisions).

### README media on GitHub

Inline `<video>` with repo-relative paths doesn't play on github.com (CSP). Static PNG previews and the live Vercel demo instead.

## Accessibility

- `aria-label` and `aria-current` on main nav and both maps
- `aria-live="polite"` on the event stream and incident feed
- Visible `:focus-visible` on nav, filter pills, list rows, and interactive map zones
- Decorative header controls marked disabled until wired
- `prefers-reduced-motion` disables gauge scan and other decorative motion

## What I'd add with a real backend

A small authenticated feed (WebSocket or SSE), server-side aggregation if multiple venues mattered, and clearer rate-limit feedback on the connection badge. Nothing secret in `NEXT_PUBLIC_*`.

The client is already shaped for that path: typed events, capped buffer, derived snapshots, connection state in the UI. That is a **possible next step**, not something this portfolio demo claims to ship.

## Background that shaped this build

Working promotions taught me that a dashboard only helps if the numbers stay trustworthy. Python from my degree plus ops experience on activations pushed me toward stable KPIs, capped buffers, and maps that show stock state — not decorative charts.

Related: [Engineering decisions — design trade-offs and rationale](/engineering-decisions) · [Architecture](/architecture) · [Pipeline](/pipeline) · [Current state](/current-state)
