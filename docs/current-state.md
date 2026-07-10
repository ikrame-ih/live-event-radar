# Current project state (Jun 2026)

Snapshot of what's shipped and where things live. App is complete; live on Vercel, docs on GitHub Pages.

## Routes

| Route        | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `/`          | Command Center — KPIs, zone inventory, SVG map, zone activity feed             |
| `/dashboard` | Telemetry — Leaflet (Teatinos), filters, event stream, buffer KPI, worker hook placeholder |

Both share `telemetry-store`. Neither redirects. Layout lives under `app/(main)/` with a persistent `AppShell` so the header and background stay mounted.

## Stock model

Zones: `South Gate` · `Sampling Court` · `Main Stage Walkway`

Map fill follows three bands — Healthy (≥ 65%, lavender grey), Watch (35–64%, peach), Low (< 35%, coral). Details in [Visual system](/visual-system).

## Key files

**Shell:** `app/_components/app-shell.tsx`, `components/AppHeader.tsx`, `components/TransitionLink.tsx`, `components/ConnectionStatusBadge.tsx`, `components/AnimatedBufferCount.tsx` (rAF count-up, bypasses React per frame)

**Command Center (`/`):** `app/(main)/page.tsx`, `ZoneHealthOverview.tsx`, `InteractiveMap.tsx`, `IncidentSidebar.tsx`, `StreamGauge.tsx`

**Telemetry (`/dashboard`):** `dashboard-live.tsx`, `VenueLeafletMap.tsx`, `event-stream-filters.tsx`, `event-stream-list.tsx`

**Stream bootstrap:** `features/live-radar/hooks/use-live-feed.ts` — shared env read + WebSocket + simulator on both routes.

`useStockWebSocket` exposes `idle | connecting | open | closed | error` — the connection badge reads that on both routes.

**Maps:** SVG schematic on `/` (zone fills from `stockHeat`); Leaflet + OpenStreetMap on `/dashboard`. Entry at south connector (`▲ ENTRY`), exit at avenue end (`EXIT ▶`).

## Tests & CI

Unit: `npm run test:run` (34 tests). E2E: `npm run test:e2e` (7 specs × 3 viewports locally; CI runs desktop only). GitHub Actions runs lint, typecheck, unit tests, and build on every PR; Playwright (desktop) on pushes to `main`. [DeepSource](https://app.deepsource.com/gh/ikrame-ih/live-event-radar/) static analysis runs on push/PR when the repo is activated.

| Surface  | URL                                                                                    |
| -------- | -------------------------------------------------------------------------------------- |
| Live app | [live-event-radar.vercel.app](https://live-event-radar.vercel.app)                     |
| Source   | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |
| Docs     | GitHub Pages (this site)                                                               |

Private build notes live in Obsidian — a superset of what's published here.

Related: [Technical decisions](/technical-decisions) · [Pipeline](/pipeline)
