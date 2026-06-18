# Technical decisions

Notes on why the app is built this way — and a few problems I hit along the way.

## Why this problem

I worked brand activations as a hostess. Stock issues showed up late — usually through WhatsApp, not through a live venue picture. LiveEvent Radar is my answer on the frontend: a Command Center that *feels* like ops telemetry, even when the feed is mocked locally.

## Stack choices

| Choice | Why |
| ------ | --- |
| **Next.js 16 (App Router)** | File-based routes, shared layouts, and a clear split between shell and pages. `(main)/layout.tsx` keeps the header mounted while content crossfades. |
| **TypeScript** | `StockEvent` and store shapes stay explicit. Easier to extend toward a real API without guessing field names. |
| **Zustand** | One `telemetry-store` shared by `/` and `/dashboard`. Less boilerplate than Redux for a single FIFO buffer and a few selectors. |
| **React SVG + Leaflet** | SVG schematic on `/` for stock heat at a glance; Leaflet on `/dashboard` for geographic context (Teatinos). I skipped Chart.js — the maps *are* the chart. |
| **Vitest + Playwright** | Unit tests for stock math and parsers; E2E for both routes on desktop, tablet, and phone. |
| **VitePress on GitHub Pages** | Public case study and architecture notes without dumping my full private vault. |

## Challenges and how I solved them

### Layout jump when KPI numbers changed

Fast-changing counts made adjacent labels shift because proportional digits have different widths. I applied `font-variant-numeric: tabular-nums` (and `tabular-nums` in Tailwind) on every live metric — KPI hero, gauge, zone cards, stream rows.

### Animating the buffer count without spamming React

Updating React state on every animation frame would rerun reconciliation ~60 times per second. For the main **Events buffered** figure I animate with `requestAnimationFrame` and write directly to a DOM ref. React still owns the data; only the display layer runs outside the render cycle. Other numbers stay static updates — one animated hero metric is enough for the demo.

### Route change flash

Remounting the full page on navigation killed the glass shell illusion. I moved routes under `app/(main)/`, wrapped content in `AppShell`, and used `TransitionLink` with the View Transitions API (~180ms crossfade). Header and background stay put.

### One ingestion path for mock and live data

Simulator ticks and WebSocket frames both call `appendEvent()`. Parsing lives in `parseStockEvent`; bad JSON frames are ignored. The UI can show **Simulator**, **Connecting**, **Live**, or **Offline** depending on env vars and socket state — same components either way.

### Worker scope

The analytics worker echoes lightweight summaries on `/dashboard`, not the full 10k event array. Sending the whole buffer would defeat the point of capping memory on the main thread.

### README media on GitHub

Inline `<video>` with repo paths does not play on github.com (CSP). I rely on the **live Vercel demo** and PNG previews instead of forcing MP4 or GIF in the README.

## Accessibility passes I cared about

- `aria-label` / `aria-current` on main nav and both maps  
- `aria-live="polite"` on the event stream when new rows arrive  
- Visible `:focus-visible` rings on nav, filter pills, and capsule rows  
- `prefers-reduced-motion` disables decorative gauge scan and non-essential motion  

## What I would add with a real backend

- Authenticated WebSocket or SSE feed with signed tokens (never in `NEXT_PUBLIC_*`)  
- Server-side aggregation for multi-venue campaigns  
- Persistent incident history and export for post-event reports  
- Rate limiting and back-pressure signals surfaced in the connection badge  

The frontend is already structured for that handoff: typed events, capped client buffer, derived snapshots, and connection state in the UI.

## Background that shaped this build

My degree covered hardware description (VHDL), Python, and deep learning — not only UI courses. That pushed me toward **measurable UI**: stable metrics, capped buffers, and maps that encode state instead of decorative charts. I am not trying to simulate a military CRT radar; I am building a **brand ops dashboard** that stays readable under live-style churn.

Related: [Architecture](/architecture) · [Pipeline](/pipeline) · [Current state](/current-state)
