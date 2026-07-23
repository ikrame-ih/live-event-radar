# Current project state (Jun 2026)

Snapshot of what's shipped and where things live. App is complete; live on Vercel, docs on GitHub Pages.

## Routes

| Route        | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `/`          | Command Center — Live now KPIs, zone stock, SVG map, Session tally             |
| `/dashboard` | Live dashboard — Leaflet venue map, filters, scrolling stock events, stored-events KPI |

Both share `telemetry-store`. Neither redirects. Layout lives under `app/(main)/` with a persistent `AppShell` so the header and background stay mounted.

## Stock model

Zones: `South Gate` · `Sampling Court` · `Main Stage Walkway`

Map fill follows three bands — Healthy (≥ 65%, teal), Watch (35–64%, amber), Low (< 35%, coral). Session tally accumulates consumed / restocked / net per zone for the session window (End event freezes; Resume / New session reopen or reset). Stock events on `/dashboard` select by event key (one row), with zone focus only for the map. Details in [Visual system](/visual-system).

## Key files

**Shell:** `app/_components/app-shell.tsx`, `components/AppHeader.tsx` (Home · Live dashboard nav only), `components/TransitionLink.tsx`, `components/ConnectionStatusBadge.tsx`, `components/AnimatedBufferCount.tsx` (rAF count-up, bypasses React per frame)

**Command Center (`/`):** `app/(main)/page.tsx`, `ZoneHealthOverview.tsx` (Zone stock), `InteractiveMap.tsx`, `SessionTallyPanel.tsx` (Session tally — End/Resume/New session), `derive-session-tally.ts`, `session-store.ts`, `StreamGauge.tsx`. `deriveIncidents` still feeds map anchors via `useEventStore`.

**Live dashboard (`/dashboard`):** `dashboard-live.tsx` (map | Stock events, equal-height cards; feed fixed at 20rem / ~5 rows), `VenueLeafletMap.tsx`, `event-stream-filters.tsx`, `event-stream-list.tsx` (per-event selection)

**Stream bootstrap:** `features/live-radar/hooks/use-live-feed.ts` — shared env read + WebSocket + simulator on both routes.

`useStockWebSocket` exposes `idle | connecting | open | closed | error` — the connection badge reads that on both routes.

**Maps:** SVG schematic on `/` (zone fills from `stockHeat`); Leaflet + OpenStreetMap on `/dashboard`. Entry at south connector (`▲ ENTRY`), exit at avenue end (`EXIT ▶`).

## Tests & CI

Unit: `npm run test:run` (Vitest). E2E: `npm run test:e2e` (specs × 3 viewports locally; CI runs desktop only). GitHub Actions runs lint, typecheck, unit tests, and build on every PR; Playwright (desktop) on pushes to `main`. Docs deploy to GitHub Pages **only on push to `main`**. [DeepSource](https://app.deepsource.com/gh/ikrame-ih/live-event-radar/) static analysis runs on push/PR when the repo is activated.

| Surface  | URL                                                                                    |
| -------- | -------------------------------------------------------------------------------------- |
| Live app | [live-event-radar.vercel.app](https://live-event-radar.vercel.app)                     |
| Source   | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |
| Docs     | GitHub Pages (this site) — deploys on **push to `main`** via `.github/workflows/docs.yml` (local doc edits are not live until then) |

Private build notes live in Obsidian — a superset of what's published here.

Related: [Technical decisions](/technical-decisions) · [Pipeline](/pipeline)
