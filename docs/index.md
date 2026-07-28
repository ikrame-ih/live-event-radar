---
layout: home
hero:
  name: LiveEvent Radar
  text: Live ops for brand activations
  tagline: See which stands are running low — venue heat maps and stock events in a glass UI Command Center with two coordinated routes in Next.js.
  actions:
    - theme: brand
      text: Live demo
      link: https://live-event-radar.vercel.app
    - theme: alt
      text: View on GitHub
      link: https://github.com/ikrame-ih/live-event-radar
    - theme: alt
      text: Architecture
      link: /architecture
features:
  - title: Command Center
    details: Primary screen at / — Live now KPIs, zone stock with Minutes-to-empty, SVG venue map, Session tally handoff, and a single restock suggestion when a zone is under pressure.
  - title: Live dashboard
    details: Secondary screen at /dashboard — Leaflet map beside a capped, scrollable stock-events list (≈5 rows visible), filters, and a small Web Worker panel for recent zone rates.
  - title: Bounded client buffer
    details: Ring-buffered Zustand store capped at 10,000 events, derived zone snapshots, optional WebSocket feed, and a small append check under synthetic bursts. Vitest + coverage · Playwright on PRs.
---

## The problem

Working big promotions as a brand hostess, the pain point was always the same: **information arriving too late**. A stand runs out of drinks mid-afternoon; the coordinator only hears about it hours later through WhatsApp or a manual count. There is no single live picture of which zones are draining stock fastest.

## What I built

A browser-based **Digital Command Center** that feels like real ops telemetry:

- **Mock stream** at ~0.5 events/s with spike bursts and a single-zone crew restock every 60s
- **Stock model** with Healthy / Watch / Low tiers (65% / 35% thresholds) driving map colour in real time
- **Minutes to empty** + one **restock suggestion** so the UI helps decide, not only display
- **Two maps** — a schematic SVG on `/`, a geographic Leaflet map on `/dashboard`
- **Shared state** — ring-buffered `telemetry-store` on both routes; incidents live in `useEventStore` on the Command Center
- **Web Worker** — sampled-window throughput / hotspots on `/dashboard`
- **Glass UI** — warm lavender shell with coral ambient orbs, frosted panels, coral nav active states (Command Center · Live dashboard), and a View Transitions crossfade (~180ms) between routes

Working promotions taught me that a dashboard only helps if the numbers stay trustworthy. Python from my degree plus ops experience on activations pushed me toward stable KPIs, capped buffers, and maps that show stock state — not decorative charts.

## Screens

| Route            | Role                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| **`/`**          | **Command Center** — Live now KPIs, zone stock, SVG venue map, What’s happening feed |
| **`/dashboard`** | **Live dashboard** — Leaflet + scrolling stock events side by side, filters, stored-events KPI |

Both routes read from **`telemetry-store`**. The Command Center also uses **`useEventStore`** for derived incidents and map/sidebar selection. Navigation uses a persistent `AppShell` and **View Transitions** via `TransitionLink` so the header and background never flash.

See the **[live demo](https://live-event-radar.vercel.app)** for the current UI.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Lucide · Leaflet · Vitest · Playwright

## Technical notes

If you want the architecture detail:

- [Technical decisions](/technical-decisions) — stack rationale, bugs I hit, accessibility, backend next steps
- [Engineering decisions — design trade-offs and rationale](/engineering-decisions)
- [Business](/business) — the ops problem this solves
- [Architecture](/architecture) — data path and how the repo evolved
- [Pipeline](/pipeline) — hooks, stores, worker, derivation
- [Benchmarks](/benchmarks) — ring buffer under burst rates

Also: [Current state](/current-state) · [Visual system](/visual-system)

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame-ih.vercel.app/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
