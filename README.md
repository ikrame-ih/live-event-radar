# LiveEvent Radar

<p align="left">
  <a href="https://github.com/ikrame-ih/live-event-radar/actions/workflows/ci.yml"><img height="28" src="https://img.shields.io/github/actions/workflow/status/ikrame-ih/live-event-radar/ci.yml?branch=main&style=for-the-badge" alt="CI" /></a>
  <a href="https://live-event-radar.vercel.app"><img height="28" src="https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
</p>

**Frontend dashboard for brand activation demos** — zone stock, venue maps, and a capped event stream in a glass UI Command Center.

Portfolio project (v0.1.0): **frontend-only**, no backend or external infra required for the default demo. A mock stream feeds the UI out of the box; an optional WebSocket URL can replace it without changing components. Both routes share one raw event buffer (`telemetry-store`); the Command Center derives incidents into a second store (`useEventStore`) for sidebar and map selection.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

|                               |                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Live app**                  | [live-event-radar.vercel.app](https://live-event-radar.vercel.app)                     |
| **Documentation**             | [GitHub Pages docs](https://ikrame-ih.github.io/live-event-radar/)                     |
| **Source**                    | [github.com/ikrame-ih/live-event-radar](https://github.com/ikrame-ih/live-event-radar) |

## Highlights

- **Command Center (`/`)** — KPIs, zone inventory, SVG venue map with stock heat tiers, synced activity feed
- **Telemetry (`/dashboard`)** — Leaflet map, filters, capped event stream, buffer KPI; worker file and hook are **placeholders only** (no active Web Worker today)
- **Shared state** — `telemetry-store` holds the raw event buffer on both routes; `useEventStore` holds derived incidents and UI selection (sidebar, map focus) on the Command Center
- **Engineering practices** — FIFO buffer cap (10k events), strict TypeScript, ESLint, 34 Vitest tests, Playwright E2E

## Engineering decisions

Short notes on choices you can walk through in an interview:

- **Capped event buffer** — events are stored in a FIFO queue with a 10k limit so long-running demos do not grow memory without bound.
- **Raw telemetry vs derived incidents** — the stream stays in one store; incident rows and map tiers are derived and cached separately so UI state does not mix with ingest.
- **Mock stream by default** — a timer-driven simulator makes the demo reproducible without standing up a WebSocket server.
- **Optional WebSocket** — set `NEXT_PUBLIC_WS_URL` to swap the feed source; the same hooks and components render either way, with a connection badge showing the active mode.

## Preview

Try the **[live demo](https://live-event-radar.vercel.app)** — Command Center at `/`, telemetry and event stream at `/dashboard`. Architecture notes and case study on [GitHub Pages](https://ikrame-ih.github.io/live-event-radar/).

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

| Command              | Purpose                             |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Dev server                          |
| `npm run build`      | Production build                    |
| `npm run lint`       | ESLint                              |
| `npm run typecheck`  | TypeScript (`tsc --noEmit`)         |
| `npm run test:run`   | Vitest unit tests                   |
| `npm run test:e2e`   | Playwright (desktop, tablet, phone) |
| `npm run docs:build` | VitePress → GitHub Pages            |

**CI (every push/PR):** lint · typecheck · unit tests · build. **E2E** runs on pushes to `main` with the **desktop** project only (7 specs). Locally, `npm run test:e2e` runs all three viewports (desktop, tablet, phone). Docs deploy to GitHub Pages on `main`.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Leaflet · Vitest · Playwright

## Environment

Copy `.env.example` → `.env.local` when using a live WebSocket feed.

| Variable                     | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_WS_URL`         | WebSocket URL (`wss://…`); empty = mock only     |
| `NEXT_PUBLIC_SIMULATOR_ONLY` | `true` = mock timer; `false` + URL = live socket |

`NEXT_PUBLIC_*` is bundled in the browser — never put secrets there.

## Project layout

```
app/                  # Next.js routes + AppShell
components/           # Shared UI
features/live-radar/  # Stream, hooks, derivation, worker placeholder
store/                # UI/domain state, incident selection
docs/                 # VitePress site + README assets
e2e/                  # Playwright specs
```

## Code quality

| Tool           | Role                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **ESLint**     | Next.js core-web-vitals + TypeScript (local + CI)                                         |
| **DeepSource** | Additional static analysis on commits/PRs — bug risks, security patterns, maintainability |
| **Vitest**     | Unit tests for parsing, stores, hooks, derivation                                         |
| **Playwright** | Smoke tests for Command Center and `/dashboard` (desktop in CI; all viewports locally)    |

DeepSource is separate from ESLint: it flags broader patterns and posts a GitHub check when the repo is connected. Setup, metric gates, and false-positive handling: [docs/development/deepsource.md](./docs/development/deepsource.md) (also on [GitHub Pages](https://ikrame-ih.github.io/live-event-radar/development/deepsource)).

## Documentation

- [Technical decisions](https://ikrame-ih.github.io/live-event-radar/technical-decisions)
- [Architecture](https://ikrame-ih.github.io/live-event-radar/architecture)
- [Data pipeline](https://ikrame-ih.github.io/live-event-radar/pipeline)
- [DeepSource setup](./docs/development/deepsource.md)

## License

MIT — see [LICENSE](./LICENSE). Vulnerability reports: [SECURITY.md](./SECURITY.md).

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame-ih.vercel.app/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
