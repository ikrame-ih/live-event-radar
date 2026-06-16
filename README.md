# LiveEvent Radar

Front-end prototype for monitoring live telemetry during brand activations — stands, SKU movement, zone stock, and event streams.

## Current app (Jun 2026)

| Route | Screen |
|-------|--------|
| **`/`** | Command Center — KPIs, alert rows, SVG venue map, zone activity |
| **`/dashboard`** | Telemetry — Leaflet map (Teatinos, Málaga), filters, event stream, buffer KPI |

Shared **Zustand** store (`telemetry-store`), mock stream ~1 evt/s with periodic restock, optional WebSocket, Web Worker echo on dashboard.

## Stack

Next.js · React · TypeScript · Tailwind CSS v4 · Zustand · Flowbite React · Lucide · Leaflet · Vitest · Playwright

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Command Center at `/`, telemetry at `/dashboard`.

## Scripts

| Command              | Purpose                    |
|----------------------|----------------------------|
| `npm run dev`        | Development server         |
| `npm run build`      | Production build           |
| `npm run start`      | Serve production build     |
| `npm run lint`       | ESLint                     |
| `npm run test`       | Vitest unit tests          |
| `npm run test:run`   | Vitest single run (CI)     |
| `npm run test:e2e`   | Playwright E2E both routes |

## Environment (optional)

Copy `.env.example` to `.env.local` for WebSocket (`NEXT_PUBLIC_WS_URL`) or simulator-only mode. MVP runs with mock data — no env vars required.

## Author

Ikrame Ibn Hayoun

## Publishing to GitHub

```bash
git push -u origin main
```

Remote: `https://github.com/ikrame-ih/live-event-radar.git`
