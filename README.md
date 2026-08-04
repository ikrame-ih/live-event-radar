# LiveEvent Radar

<p align="left">
  <a href="https://github.com/ikrame-ih/live-event-radar/actions/workflows/ci.yml"><img height="28" src="https://img.shields.io/github/actions/workflow/status/ikrame-ih/live-event-radar/ci.yml?branch=main&style=for-the-badge" alt="CI" /></a>
  <a href="https://github.com/ikrame-ih/live-event-radar/actions/workflows/ci.yml"><img height="28" src="https://img.shields.io/badge/tests-Vitest_%2B_Playwright-222?style=for-the-badge" alt="Vitest and Playwright in CI" /></a>
  <a href="https://live-event-radar.vercel.app"><img height="28" src="https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://ikrame-ih.github.io/live-event-radar/"><img height="28" src="https://img.shields.io/badge/Docs-GitHub_Pages-222?style=for-the-badge" alt="Docs" /></a>
</p>

**A frontend tool for activation ops** — helps coordinators spot stands that may run out of stock before the usual WhatsApp scramble.

It is a **realistic operational scenario** built as a Next.js demo: zone stock, venue maps, a Session tally you can copy/export, and a capped client-side event stream. No backend is required for the default mock feed; an optional WebSocket URL can replace the simulator.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

|                               |                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Live app**                  | [live-event-radar.vercel.app](https://live-event-radar.vercel.app)                     |
| **Documentation**             | [GitHub Pages docs](https://ikrame-ih.github.io/live-event-radar/)                     |
| **Source**                    | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |

## The problem

On brand activations, stock problems often show up late. A stand runs dry mid-afternoon; the coordinator only hears through chat or a manual count. There is no shared live picture of which zones are draining fastest.

LiveEvent Radar explores that problem in the browser: one Command Center for “what needs attention now,” plus a Live dashboard for the raw stream.

## What you get

| Surface | Role |
| ------- | ---- |
| **`/` Command Center** | KPIs, zone stock, heuristic **Minutes to empty**, optional restock hint, SVG venue map, Session tally (freeze / copy / CSV) |
| **`/dashboard`** | Leaflet map + scrolling stock events, filters, and a small **client-side analytics** panel (Web Worker over a short sample window) |

Both routes share one capped ring buffer (`telemetry-store`). The ETA is a **recent-pace heuristic**, not a predictive model.

## 60-second demo path

Open the [live demo](https://live-event-radar.vercel.app) (or watch the walkthrough notes below):

1. Land on **`/`**. The simulator seeds ~3 minutes of history, so **Zone stock** and **Minutes to empty** already show pressure — not a blank 100% screen.
2. If a zone is under pressure, look for the **Suggested move** banner (one donor → one needy zone).
3. In **Session tally**, try **Copy** or **Export CSV**, then **End event** to freeze totals.
4. Switch to **`/dashboard`**. Same buffer, different job: map + event list + **Zone throughput** (worker sample).
5. Things worth noticing as a reviewer: buffer cap, connection badge, tabular numbers that do not jump, View Transitions between routes.

### Walkthrough recording

GitHub README CSP blocks inline repo videos. Prefer the live demo above, or regenerate full-page PNGs locally:

```bash
CAPTURE_README=1 npx playwright test e2e/capture-readme.spec.ts --project=desktop
```

Then drop a short screen recording (60–90s) on GitHub user-attachments / Streamable / YouTube and link it here — for example:

> [Watch a 90s walkthrough](https://live-event-radar.vercel.app) → follow the path above on the live app.

## Frontend architecture (short)

```
mock timer or optional WebSocket
  → parseStockEvent
  → ring buffer (cap 10k)
  → derive snapshots / ETA / session tally (main thread)
  → sample recent window → Web Worker throughput summary (/dashboard)
```

Interesting decisions (detail in docs):

- **Ring buffer** instead of an ever-growing array — operators care about recent flow, not unlimited history.
- **Worker for one job only** (windowed rates / hotspots), not for every derivation.
- **Two maps on purpose** — SVG schematic for glanceability; Leaflet for venue context.

## Trade-offs and limitations

- Default data is **simulated**; live WebSocket is optional and unauthenticated in this demo.
- **Minutes to empty** assumes the last ~60s pace continues; it ignores upcoming restocks and is not SKU-accurate.
- The append **bench** checks that the buffer stays capped under synthetic bursts — it is **not** a browser FPS or production load test.
- No auth, multi-venue backend, or multi-tenant model in this repo (on purpose).

## Preview

<table>
  <tr>
    <td width="50%">
      <img src="./docs/assets/readme/command-center-activity.png" alt="Command Center — zone stock, SVG map, Session tally" />
      <br /><sub><b>/</b> — Command Center</sub>
    </td>
    <td width="50%">
      <img src="./docs/assets/readme/telemetry-dashboard.png" alt="Live dashboard — Leaflet map and event stream" />
      <br /><sub><b>/dashboard</b> — Live dashboard</sub>
    </td>
  </tr>
</table>

## Quick start

**Prerequisites:** Node.js 20+, npm.

```bash
git clone https://github.com/ikrame-ih/live-event-radar.git
cd live-event-radar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables required for the mock demo.

## Scripts

| Command                 | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Dev server                                   |
| `npm run build`         | Production build                             |
| `npm run lint`          | ESLint                                       |
| `npm run typecheck`     | TypeScript (`tsc --noEmit`)                  |
| `npm run test:run`      | Vitest unit tests                            |
| `npm run test:coverage` | Vitest + V8 coverage                         |
| `npm run bench`         | Ring-buffer append check (synthetic bursts)  |
| `npm run test:e2e`      | Playwright (desktop, tablet, phone)          |
| `npm run docs:build`    | VitePress → GitHub Pages                     |

**CI (every push/PR):** lint · typecheck · coverage · bench · `npm audit` (high+, soft-fail — see SECURITY.md) · build · desktop E2E. Docs deploy to GitHub Pages on push to `main`. Coverage badge ≈ Vitest line coverage on `features/live-radar` + `store` (regenerate with `npm run test:coverage`).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Leaflet · Web Workers · Vitest · Playwright

## Environment

Copy `.env.example` → `.env.local` when using a live WebSocket feed.

| Variable                     | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_WS_URL`         | WebSocket URL (`wss://…`); empty = mock only     |
| `NEXT_PUBLIC_SIMULATOR_ONLY` | `true` = mock timer; `false` + URL = live socket |

`NEXT_PUBLIC_*` is bundled in the browser — never put secrets there.

Optional local feed:

```bash
npm i -D ws
npm run mock:ws
# then NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8787 and NEXT_PUBLIC_SIMULATOR_ONLY=false
```

## Project layout

```
app/                  # Next.js routes + AppShell
components/           # Shared UI
features/live-radar/  # Stream, hooks, derivation, ring buffer, worker
store/                # Incident selection for the Command Center map
docs/                 # Case study + engineering notes
e2e/                  # Playwright specs
```

## Possible next steps

If this grew beyond a portfolio demo: a small authenticated feed (WebSocket or SSE), server-side aggregation for multiple venues, and clearer rate-limit feedback in the connection badge. The client event shape and capped buffer are already compatible with that path.

## Documentation

- [Decisions & challenges](https://ikrame-ih.github.io/live-event-radar/decisions) — design trade-offs, bugs hit, CSP notes
- [Architecture](https://ikrame-ih.github.io/live-event-radar/architecture) — data path and ring-buffer explainer
- [Benchmarks](https://ikrame-ih.github.io/live-event-radar/benchmarks) — what the append check does (and does not) claim
- [Data pipeline](https://ikrame-ih.github.io/live-event-radar/pipeline)
- [Lessons learned](https://ikrame-ih.github.io/live-event-radar/lessons-learned)

## License

MIT — see [LICENSE](./LICENSE). Vulnerability reports: [SECURITY.md](./SECURITY.md).

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame.dev/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
