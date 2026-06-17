---
layout: home
hero:
  name: LiveEvent Radar
  text: Live operations telemetry for brand activations
  tagline: Zone stock, venue heat maps, and a capped event stream — a glass UI Command Center with two coordinated routes in Next.js.
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
    details: Primary screen at / — KPIs, zone inventory, SVG venue map with stock heat tiers, and a synced activity feed.
  - title: Telemetry depth
    details: Secondary screen at /dashboard — Leaflet map (Teatinos, Málaga), filters, FIFO event stream, and Web Worker echo.
  - title: Stable under load
    details: Zustand buffer capped at 10,000 events, derived zone snapshots, optional WebSocket. 20 Vitest tests · 18 Playwright runs.
---

## The problem

Working big promotions as a brand hostess, the pain point was always the same: **information arriving too late**. A stand runs out of drinks mid-afternoon; central coordination only hears about it hours later through WhatsApp or manual counts. There is no single live picture of which zones are draining stock fastest.

## What I built

A browser-based **Digital Command Center** that feels like real ops telemetry:

- **Mock stream** at ~0.5 events/s with spike bursts and single-zone crew restock every 60s
- **Stock model** with Healthy / Watch / Low tiers (65% / 35% thresholds) driving map colour
- **Two maps** — schematic SVG on `/`, geographic Leaflet on `/dashboard`
- **Shared state** — one `telemetry-store`, incidents derived into `useEventStore` for the Command Center
- **Glass UI** — lavender shell, frosted panels, macOS-style active states, View Transitions (~180ms) between routes

## Screens

| Route | Role |
| ----- | ---- |
| **`/`** | **Command Center** — KPIs, zone inventory, SVG venue map (stock heat), zone activity feed |
| **`/dashboard`** | **Telemetry** — Leaflet map (Teatinos, Málaga), filters, capped FIFO stream, buffer KPI, Web Worker echo |

Both routes share one **Zustand** store (`telemetry-store`). Navigation uses a persistent `AppShell` and **View Transitions** via `TransitionLink`.

## Preview

<p align="center">
  <img src="./assets/readme/hero-command-center.png" alt="Command Center — KPIs, gauge, zone inventory" width="720" />
</p>

<p align="center">
  <img src="./assets/readme/hero-venue-map-heat.png" alt="SVG venue map with stock heat tiers" width="720" />
</p>

<p align="center">
  <strong><a href="https://live-event-radar.vercel.app">▶ Try the live demo</a></strong>
  — Command Center → Telemetry transition, live stream, and stock heat in the browser
</p>

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Flowbite React · Lucide · Leaflet · Vitest · Playwright

## Technical notes

Three deep dives for recruiters who want architecture detail (~5 min total):

| Note | Topic |
| ---- | ----- |
| [Business](/business) | Operational problem and ROI framing |
| [Architecture](/architecture) | Data path, stack, project evolution |
| [Pipeline](/pipeline) | Hooks, store, worker, derivation layer |

Further reading: [Current state](/current-state) · [Visual system](/visual-system)

## Author

**Ikrame Ibn Hayoun** — front-end portfolio project, Jun 2026.
