# Current project state (Jul 2026)

Snapshot of what's shipped and where things live. App is complete; live on Vercel, docs on GitHub Pages.

## Routes

| Route        | Purpose                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `/`          | Command Center — KPIs, zone stock + ETA, suggestion, SVG map, Session tally (Copy / CSV)         |
| `/dashboard` | Live dashboard — Leaflet map, filters, scrolling stock events, Worker throughput panel           |

Both share ring-buffered `telemetry-store`. Layout lives under `app/(main)/` with a persistent `AppShell`.

## Stock model

Zones: `South Gate` · `Sampling Court` · `Main Stage Walkway`

Map fill follows three bands — Healthy (≥ 65%, teal), Watch (35–64%, amber), Low (< 35%, coral). **Minutes to empty** uses the last ~60s consumption pace (heuristic; see engineering decisions). Session tally freezes with End event; handoff text includes ETA + optional suggested move.

## Key files

**Shell:** `app/_components/app-shell.tsx`, `components/AppHeader.tsx`, `TransitionLink.tsx`, `ConnectionStatusBadge.tsx`, `AnimatedBufferCount.tsx`

**Command Center (`/`):** `page.tsx`, `ZoneHealthOverview.tsx` / `ZoneHealthCard.tsx` (ETA), `OpsSuggestionBanner.tsx`, `InteractiveMap.tsx`, `SessionTallyPanel.tsx` (Copy + Export CSV), `StreamGauge.tsx`. `deriveIncidents` feeds map anchors via `useEventStore`.

**Live dashboard (`/dashboard`):** `dashboard-live.tsx`, `WorkerThroughputPanel.tsx`, Leaflet map, event stream filters/list

**Ingest & analytics:** `ring-buffer.ts`, `telemetry-store.ts`, `use-live-feed.ts`, `use-analytics-worker.ts`, `analytics.worker.ts`, `zone-throughput.ts`, `estimate-minutes-until-empty.ts`, `suggest-restock.ts`

## Tests & CI

| Command | Role |
| ------- | ---- |
| `npm run test:run` | Vitest unit |
| `npm run test:coverage` | Vitest + lcov (uploaded in CI) |
| `npm run bench` | Ring append harness |
| `npm run test:e2e` | Playwright (3 viewports local; desktop in CI on every PR/push) |

Dependabot weekly for npm. Docs deploy to GitHub Pages **only on push to `main`**.

| Surface  | URL                                                                                    |
| -------- | -------------------------------------------------------------------------------------- |
| Live app | [live-event-radar.vercel.app](https://live-event-radar.vercel.app)                     |
| Source   | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |
| Docs     | This GitHub Pages site                                                                 |

Related: [Engineering decisions — design trade-offs and rationale](/engineering-decisions) · [Benchmarks](/benchmarks) · [Pipeline](/pipeline)
