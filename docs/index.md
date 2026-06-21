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
    details: Secondary screen at /dashboard — Leaflet map (Teatinos, Málaga), filters, a capped event stream, and a Web Worker running in the background.
  - title: Stable under load
    details: Zustand buffer capped at 10,000 events, derived zone snapshots, optional WebSocket feed. 20 Vitest tests · 18 Playwright runs.
---

## The problem

Working big promotions as a brand hostess, the pain point was always the same: **information arriving too late**. A stand runs out of drinks mid-afternoon; the coordinator only hears about it hours later through WhatsApp or a manual count. There is no single live picture of which zones are draining stock fastest.

## What I built

A browser-based **Digital Command Center** that feels like real ops telemetry:

- **Mock stream** at ~0.5 events/s with spike bursts and a single-zone crew restock every 60s
- **Stock model** with Healthy / Watch / Low tiers (65% / 35% thresholds) driving map colour in real time
- **Two maps** — a schematic SVG on `/`, a geographic Leaflet map on `/dashboard`
- **Shared state** — one Zustand store (`telemetry-store`) feeds both routes; incidents are derived into `useEventStore` for the Command Center
- **Glass UI** — lavender shell, frosted panels, macOS-style active states, and a View Transitions crossfade (~180ms) between routes

VHDL, Python, and deep learning in my degree — not just UI courses — probably explains why I care about tabular metrics that don't jump, buffers that don't grow forever, and maps that carry the data instead of decorative charts.

## Screens

| Route            | Role                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **`/`**          | **Command Center** — KPIs, zone inventory, SVG venue map (stock heat), zone activity feed                |
| **`/dashboard`** | **Telemetry** — Leaflet map (Teatinos, Málaga), filters, capped event stream, buffer KPI, Web Worker     |

Both routes share one **Zustand** store. Navigation uses a persistent `AppShell` and **View Transitions** via `TransitionLink` so the header and background never flash.

## Preview

<table>
  <tr>
    <td width="50%">
      <img
        src="./assets/readme/command-center-activity.png"
        alt="Zone inventory and activity feed"
      />
      <br />
      <sub><b>Command Center</b> — zone stock tiers, SVG map, synced activity rows</sub>
    </td>
    <td width="50%">
      <img
        src="./assets/readme/telemetry-dashboard.png"
        alt="Telemetry dashboard with Leaflet map and event stream"
      />
      <br />
      <sub><b>Telemetry</b> — Leaflet map (Teatinos), filters, capped event stream</sub>
    </td>
  </tr>
</table>

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Flowbite React · Lucide · Leaflet · Vitest · Playwright

## Technical notes

If you want the architecture detail:

- [Technical decisions](/technical-decisions) — stack rationale, bugs I hit, accessibility, backend next steps
- [Business](/business) — the ops problem this solves
- [Architecture](/architecture) — data path and how the repo evolved
- [Pipeline](/pipeline) — hooks, store, worker, derivation

Also: [Current state](/current-state) · [Visual system](/visual-system)

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame-ih.vercel.app/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
