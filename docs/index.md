---
layout: home
hero:
  name: LiveEvent Radar
  text: Live ops for brand activations
  tagline: See which stands are running low — venue heat maps and stock events in a Command Center with two coordinated routes in Next.js.
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
    details: Secondary screen at /dashboard — Leaflet map beside a capped stock-events list, filters, and a Web Worker panel for recent zone rates.
  - title: Bounded client buffer
    details: Ring-buffered Zustand store capped at 10,000 events, derived zone snapshots, optional WebSocket feed, and an append check under synthetic bursts. Vitest + Playwright on PRs.
---

## The problem

Working big promotions as a brand hostess, the pain point was always the same: **information arriving too late**. A stand runs out of drinks mid-afternoon; the coordinator only hears about it hours later through WhatsApp or a manual count. There is no single live picture of which zones are draining stock fastest.

## What I built

A browser-based **Digital Command Center** that feels like real ops telemetry:

- **Seeded mock stream** — ~3 minutes of history on load, then ~0.5 events/s with spike bursts and a crew restock every 60s
- **Stock model** with Healthy / Watch / Low tiers driving map colour in real time
- **Minutes to empty** + one **restock suggestion** so the UI helps decide, not only display
- **Two maps** — schematic SVG on `/`, geographic Leaflet on `/dashboard`
- **Shared state** — ring-buffered `telemetry-store` on both routes
- **Web Worker** — sampled-window throughput / hotspots on `/dashboard`

Working promotions taught me that a dashboard only helps if the numbers stay trustworthy. Python from my degree plus ops experience on activations pushed me toward stable KPIs, capped buffers, and maps that show stock state — not decorative charts.

## Screens

![Command Center](/assets/readme/command-center-activity.png)

_`/` — Command Center with zone stock, SVG map, and Session tally_

![Live dashboard](/assets/readme/telemetry-dashboard.png)

_`/dashboard` — Leaflet map and scrolling stock events_

| Route | Role |
| ----- | ---- |
| **`/`** | **Command Center** — KPIs, zone stock, SVG venue map, Session tally |
| **`/dashboard`** | **Live dashboard** — Leaflet + stock events, filters, worker panel |

Both routes read from **`telemetry-store`**. Navigation uses a persistent `AppShell` and **View Transitions** so the header never flashes.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Lucide · Leaflet · Vitest · Playwright

## Go deeper

- [Decisions & challenges](/decisions) — trade-offs, bugs I hit, accessibility, CSP notes
- [Architecture](/architecture) — data path, ring buffer explainer, current routes
- [Pipeline](/pipeline) — hooks, stores, worker, derivation
- [Benchmarks](/benchmarks) — what the append check does and does not claim
- [Lessons learned](/lessons-learned) — personal notes from the build
- [Business](/business) · [Visual system](/visual-system)

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame-ih.vercel.app/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
