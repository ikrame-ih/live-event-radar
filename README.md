# LiveEvent Radar

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://live-event-radar.vercel.app)
[![Docs](https://img.shields.io/badge/Docs-6366f1?style=for-the-badge)](https://ikrame-ih.github.io/live-event-radar/)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

Browser-based ops dashboard for brand activations: zone stock, venue maps, and a capped event stream. Two routes (`/` and `/dashboard`) share one Zustand buffer; data comes from a mock timer by default, with an optional WebSocket feed.

Built as a portfolio prototype — **v0.1.0**, frontend-only, no backend in this repo.

**Docs:** [Technical decisions](https://ikrame-ih.github.io/live-event-radar/technical-decisions) · [Architecture](https://ikrame-ih.github.io/live-event-radar/architecture) · [Pipeline](https://ikrame-ih.github.io/live-event-radar/pipeline)

## Why this stack

- **Next.js App Router** — file-based routes for `/` and `/dashboard` without extra routing config; static export-friendly for Vercel.
- **Zustand** — one shared telemetry buffer with minimal boilerplate (I wanted to focus on the stream logic, not Redux setup).
- **Tailwind v4 + Vitest/Playwright** — fast UI iteration and automated checks a recruiter can run locally in under a minute.

## Preview

<table>
  <tr>
    <td width="50%">
      <img src="./docs/assets/readme/command-center-activity.png" alt="Command Center" />
      <br /><sub><b>/</b> — zone stock, SVG map, activity feed</sub>
    </td>
    <td width="50%">
      <img src="./docs/assets/readme/telemetry-dashboard.png" alt="Telemetry dashboard" />
      <br /><sub><b>/dashboard</b> — Leaflet map, filters, event stream</sub>
    </td>
  </tr>
</table>

## Quick start

**Prerequisites:** Node.js **20+**, npm (comes with Node).

```bash
git clone https://github.com/ikrame-ih/live-event-radar.git
cd live-event-radar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No env vars required for the mock demo.

## Scripts

| Command              | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Dev server                       |
| `npm run build`      | Production build                 |
| `npm run lint`       | ESLint                           |
| `npm run typecheck`  | TypeScript (`tsc --noEmit`)      |
| `npm run test:run`   | Vitest unit tests                |
| `npm run test:e2e`   | Playwright (local; 3 viewports)  |
| `npm run docs:build` | VitePress → GitHub Pages         |

CI on push/PR: lint, typecheck, unit tests, build. E2E (desktop) runs on `main` after those pass.

## Environment

Copy `.env.example` → `.env.local` if needed.

| Variable                     | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_WS_URL`         | WebSocket URL (`wss://…`); empty = mock only  |
| `NEXT_PUBLIC_SIMULATOR_ONLY` | `true` mock timer; `false` + URL = live socket |

`NEXT_PUBLIC_*` is bundled in the browser — **never put secrets there.**

## Project layout

```
app/                  # Next.js routes + AppShell
components/           # Shared UI
features/live-radar/  # Stream, store, derivation, worker
store/                # Command Center incident selection
design/wireframes/    # Early UI sketch (Excalidraw, repo only)
docs/                 # VitePress site + README assets
e2e/                  # Playwright specs
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Leaflet · Vitest · Playwright

## License & security

MIT — see [LICENSE](./LICENSE). To report a vulnerability: [SECURITY.md](./SECURITY.md).

## Author

**Ikrame Ibn Hayoun** — [Portfolio](https://ikrame-ih.vercel.app/) · [GitHub](https://github.com/ikrame-ih) · [LinkedIn](https://www.linkedin.com/in/ikrame-ih/)
