---
layout: home
hero:
  name: LiveEvent Radar
  text: Live operations telemetry for brand activations
  tagline: Zone stock, venue heat maps, and a capped event stream — built in Next.js with a glass UI shell and two coordinated routes.
  actions:
    - theme: brand
      text: Live demo
      link: https://live-event-radar.vercel.app
    - theme: alt
      text: View on GitHub
      link: https://github.com/ikrame-ih/live-event-radar
    - theme: alt
      text: Architecture notes
      link: /architecture
features:
  - title: Command Center
    details: Primary screen at / — KPIs, zone inventory, SVG venue map with stock heat tiers, and a synced activity feed.
  - title: Telemetry depth
    details: Secondary screen at /dashboard — Leaflet map (Teatinos, Málaga), filters, FIFO event stream, and Web Worker echo.
  - title: Stable under load
    details: Zustand buffer capped at 10,000 events, derived zone snapshots, optional WebSocket, Vitest + Playwright coverage.
---

## The problem

Working big promotions as a brand hostess, the pain point was always the same: **information arriving too late**. A stand runs out of drinks mid-afternoon; central coordination only hears about it hours later through WhatsApp or manual counts. There is no single live picture of which zones are draining stock fastest.

## What I built

A browser-based **Digital Command Center** that feels like real ops telemetry:

- **Mock stream** at ~0.5 events/s with spike bursts and single-zone crew restock every 60s
- **Stock model** with Healthy / Watch / Low tiers (65% / 35% thresholds) driving map colour
- **Two maps** — schematic SVG on `/`, geographic Leaflet on `/dashboard`
- **Shared state** — one `telemetry-store`, incidents derived into `useEventStore` for the Command Center
- **Glass UI** — lavender shell, frosted panels, macOS-style active states, View Transitions between routes

## Preview

<p align="center">
  <img src="./assets/readme/hero-command-center.png" alt="Command Center" width="720" />
</p>

<p align="center">
  <video src="./assets/readme/demo.mp4" width="720" autoplay loop muted playsinline></video>
</p>

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Leaflet · Vitest · Playwright

## How the app evolved

| Phase | Milestone |
| ----- | --------- |
| MVP | Single `/dashboard`, four panels, Canvas heatmap |
| Command Center | `/` as primary screen, SVG map, incident sidebar |
| UI redesign | Glass design system, Leaflet telemetry, stock tiers |
| Polish | Shared `AppShell`, View Transitions, README MP4 showcase |

Full evolution → [Architecture](/architecture#project-evolution)

## Deep dive notes

| Note | Topic |
| ---- | ----- |
| [Business](/business) | Operational problem and ROI framing |
| [Architecture](/architecture) | Data path, stack, evolution |
| [Pipeline](/pipeline) | Hooks, store, worker, event shape |
| [Current state](/current-state) | Routes, components, tests (Jun 2026) |
| [Visual system](/visual-system) | Tokens, glass, motion catalogue |

## Author

**Ikrame Ibn Hayoun** — front-end portfolio project, Jun 2026.
