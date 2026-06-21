# Technical decisions

Notes on why the app is built this way — and a few real problems I ran into while building it.

## Why this problem

I worked brand activations as a hostess. Stock issues always showed up late — usually through WhatsApp, never through a live picture of the venue. LiveEvent Radar is my frontend answer to that: a Command Center that *feels* like an ops dashboard, even when the data feed is simulated locally.

## Stack choices

| Choice | Why |
| ------ | --- |
| **Next.js 16 (App Router)** | File-based routes and shared layouts make the shell architecture simple. `(main)/layout.tsx` keeps the header and background mounted while only the page content swaps on navigation. |
| **TypeScript** | The `StockEvent` type and store shapes are explicit. Adding a real API later means no guesswork about what fields the server sends. |
| **Zustand** | One `telemetry-store` shared by both routes. Much less setup than Redux for a buffer and a few computed values. |
| **React SVG + Leaflet** | Hand-drawn SVG schematic on `/` for stock heat at a glance. Leaflet on `/dashboard` for geographic context. I skipped Chart.js — the maps already encode the data. |
| **Vitest + Playwright** | Vitest for stock math and parsers. Playwright for both routes across desktop, tablet, and phone. |
| **VitePress on GitHub Pages** | Publish the case study without sharing my full private notes. |

## Challenges and how I solved them

### Layout jump when KPI numbers changed

Proportional web fonts make digit widths vary — "1" is narrower than "8", so live counters shift adjacent labels. I applied `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) to every live metric: KPI hero, gauge, zone cards, stream rows.

### Animating the buffer count without spamming React

Storing animation progress in React state would re-render ~60 times per second for a purely visual tick. For **Events buffered** I animate with `requestAnimationFrame` and write to a DOM ref instead. React still owns the value; only the display layer runs outside the render cycle.

### Route change flash

Navigating between `/` and `/dashboard` used to remount everything including background and header. I moved both routes under `app/(main)/`, shared `AppShell`, and wired `TransitionLink` to the View Transitions API (~180ms crossfade). Header and background stay put.

### One ingestion path for mock and live data

Mock simulator and WebSocket both call `appendEvent()`. `parseStockEvent` guards malformed JSON frames. The UI shows **Simulator**, **Connecting**, **Live**, or **Offline** from env vars and socket state — same components either way.

### Web Worker scope

The analytics worker on `/dashboard` receives lightweight summaries, not the full 10,000-event buffer. Sending the whole array across threads would undo the memory cap.

### README media on GitHub

Inline `<video>` with repo-relative paths doesn't play on github.com (CSP). Static PNG previews and the live Vercel demo instead.

## Accessibility

- `aria-label` and `aria-current` on main nav and both maps
- `aria-live="polite"` on the event stream
- Visible `:focus-visible` on nav, filter pills, list rows
- `prefers-reduced-motion` disables gauge scan and other decorative motion

## What I'd add with a real backend

Authenticated WebSocket or SSE with signed tokens (nothing secret in `NEXT_PUBLIC_*`), server-side aggregation for multi-venue campaigns, persistent incident export, rate limiting surfaced in the connection badge.

The client is already structured for that: typed events, capped FIFO buffer, derived snapshots, connection state in the UI.

## Background that shaped this build

My degree covered VHDL, Python, and deep learning — not just UI courses. That pushed me toward measurable UI: stable metrics, capped buffers, maps that encode state rather than decorative charts.

Related: [Architecture](/architecture) · [Pipeline](/pipeline) · [Current state](/current-state)
