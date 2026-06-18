# Current project state (Jun 2026)

Single source of truth for routes, components, stock model, maps, tests, and deploy status.

**Status:** App complete. Public docs on GitHub Pages. Live demo on Vercel. README preview PNGs. Recruiter polish: technical decisions page, connection badge, animated buffer KPI, a11y pass.

## Routes

| Route | Name | Purpose |
| ----- | ---- | ------- |
| `/` | Command Center | KPIs, Zone inventory, SVG venue map (stock heat), Zone activity |
| `/dashboard` | Telemetry | Leaflet Teatinos, filters, event stream, buffer KPI, worker echo |

Both routes share `telemetry-store`. Neither redirects to the other.

**Layout:** `app/(main)/` route group — shared `AppShell` (header + background persist). URLs unchanged.

## Visual system (summary)

| Token / class | Role |
| ------------- | ---- |
| `.bry-shell` / `.bry-glass` | Frosted glass container |
| `.bry-box` | Nested panels |
| `.bry-row-capsule` | Floating rows |
| `--accent-macos` | Active nav + filter accent |
| `TransitionLink` | View Transitions crossfade ~180ms |

Detail → [Visual system](/visual-system)

## Stock tiers

| Band | Range | Map fill |
| ---- | ----- | -------- |
| Healthy | ≥ 65% | Lavender grey |
| Watch | 35–64% | Peach |
| Low | < 35% | Coral |

Zones: `South Gate` · `Sampling Court` · `Main Stage Walkway`

## Key components

### Shared shell

| Component | File |
| --------- | ---- |
| App shell | `app/_components/app-shell.tsx` |
| Header | `components/AppHeader.tsx` |
| Route transitions | `components/TransitionLink.tsx` |
| Connection badge | `components/ConnectionStatusBadge.tsx` |
| Animated buffer KPI | `components/AnimatedBufferCount.tsx` (rAF, Command Center) |

### Command Center (`/`)

| Component | File |
| --------- | ---- |
| Page | `app/(main)/page.tsx` |
| Zone inventory | `components/ZoneHealthOverview.tsx` |
| SVG map | `components/InteractiveMap.tsx` |
| Activity feed | `components/IncidentSidebar.tsx` |
| Gauge | `components/StreamGauge.tsx` |

### Telemetry (`/dashboard`)

| Component | File |
| --------- | ---- |
| Live view | `app/(main)/dashboard/dashboard-live.tsx` |
| Leaflet map | `components/VenueLeafletMap.tsx` |
| Filters / stream | `event-stream-filters.tsx`, `event-stream-list.tsx` |

`useStockWebSocket` exposes `idle | connecting | open | closed | error` for the feed badge on both routes.

## Maps

| Surface | Route | Tech |
| ------- | ----- | ---- |
| Schematic | `/` | React SVG — fill by `stockHeat` |
| Geographic | `/dashboard` | Leaflet + OpenStreetMap |

ENTRY at south connector (`▲ ENTRY`). EXIT at avenue end (`EXIT ▶`).

## Testing

| Layer | Command | Coverage |
| ----- | ------- | -------- |
| Unit | `npm test` | store, mocks, zone-stock, parsers |
| E2E | `npm run test:e2e` | both routes, 3 viewports |
| Showcase | `npm run capture:readme` | hero PNGs |

Last verified: **20** Vitest · Playwright on `/` and `/dashboard`.

## Publishing

| Surface | URL |
| ------- | --- |
| Live app | [live-event-radar.vercel.app](https://live-event-radar.vercel.app) |
| Source | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |
| Architecture docs | GitHub Pages (this site) |
| Technical decisions | [technical-decisions](/technical-decisions) on this site |
| Private study vault | Obsidian — full build journal + error log |

## Repo layout

| Path | Contents |
| ---- | -------- |
| `live-event-radar/` | Next.js app (GitHub repo) |
| `live-event-radar/docs/` | Public docs + README assets |
| `docs/` (Obsidian vault) | Private study notes — superset of published docs |
