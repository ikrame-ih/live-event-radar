# Current project state (Jun 2026)

A snapshot of everything shipped: routes, components, stock model, maps, tests, and deploy.

**Status:** App complete. Public docs on GitHub Pages. Live demo on Vercel. README preview screenshots. Recruiter polish: technical decisions page, WebSocket connection badge, animated buffer KPI, accessibility pass.

## Routes

| Route | Name | Purpose |
| ----- | ---- | ------- |
| `/` | Command Center | KPIs, zone inventory, SVG venue map (stock heat), zone activity feed |
| `/dashboard` | Telemetry | Leaflet map of Teatinos, filters, event stream, buffer KPI, Web Worker echo |

Both routes share `telemetry-store`. Neither redirects to the other.

**Layout:** `app/(main)/` route group — a shared `AppShell` keeps the header and background mounted. URLs are unchanged.

## Visual system (summary)

| Token / class | Role |
| ------------- | ---- |
| `.bry-shell` / `.bry-glass` | Frosted glass container (backdrop blur) |
| `.bry-box` | Nested panel cards |
| `.bry-row-capsule` | Floating list rows |
| `--accent-macos` | Blue active state on nav and filter pills |
| `TransitionLink` | View Transitions crossfade (~180ms between routes) |

Full detail → [Visual system](/visual-system)

## Stock tiers

Zones change colour in real time as the stock percentage moves across thresholds:

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
| Animated buffer KPI | `components/AnimatedBufferCount.tsx` (uses `requestAnimationFrame` for smooth count-up) |

### Command Center (`/`)

| Component | File |
| --------- | ---- |
| Page | `app/(main)/page.tsx` |
| Zone inventory | `components/ZoneHealthOverview.tsx` |
| SVG map | `components/InteractiveMap.tsx` |
| Activity feed | `components/IncidentSidebar.tsx` |
| Stream gauge | `components/StreamGauge.tsx` |

### Telemetry (`/dashboard`)

| Component | File |
| --------- | ---- |
| Live view | `app/(main)/dashboard/dashboard-live.tsx` |
| Leaflet map | `components/VenueLeafletMap.tsx` |
| Filters / stream | `event-stream-filters.tsx`, `event-stream-list.tsx` |

`useStockWebSocket` returns one of `idle | connecting | open | closed | error`, which the connection badge uses to show the current feed state on both routes.

## Maps

| Surface | Route | Tech |
| ------- | ----- | ---- |
| Schematic | `/` | React SVG — zone fills driven by `stockHeat` |
| Geographic | `/dashboard` | Leaflet + OpenStreetMap tiles |

Entry at the south connector (`▲ ENTRY`). Exit at the avenue end (`EXIT ▶`).

## Testing

| Layer | Command | Coverage |
| ----- | ------- | -------- |
| Unit | `npm test` | Store, mocks, zone-stock math, parsers |
| E2E | `npm run test:e2e` | Both routes, 3 viewports |
| Showcase | `npm run capture:readme` | Regenerates hero PNGs for README |

Last verified: **20** Vitest tests · Playwright on `/` and `/dashboard`.

## Publishing

| Surface | URL |
| ------- | --- |
| Live app | [live-event-radar.vercel.app](https://live-event-radar.vercel.app) |
| Source | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |
| Architecture docs | GitHub Pages (this site) |
| Technical decisions | [technical-decisions](/technical-decisions) on this site |
| Private study vault | Obsidian — full build journal and error log |

## Repo layout

| Path | Contents |
| ---- | -------- |
| `live-event-radar/` | Next.js app (GitHub repo root) |
| `live-event-radar/docs/` | Public docs and README assets |
| `docs/` (Obsidian vault) | Private study notes — superset of published docs |
