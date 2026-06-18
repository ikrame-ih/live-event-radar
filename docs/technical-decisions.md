# Technical decisions

Notes on why the app is built this way — and a few real problems I ran into while building it.

## Why this problem

I worked brand activations as a hostess. Stock issues always showed up late — usually through WhatsApp, never through a live picture of the venue. LiveEvent Radar is my frontend answer to that: a Command Center that *feels* like an ops dashboard, even when the data feed is simulated locally.

## Stack choices

| Choice | Why |
| ------ | --- |
| **Next.js 16 (App Router)** | File-based routes and shared layouts make the shell architecture simple. `(main)/layout.tsx` keeps the header and background mounted while only the page content swaps on navigation. |
| **TypeScript** | The `StockEvent` type and store shapes are explicit. Adding a real API later means no guesswork about what fields the server sends. |
| **Zustand** | One `telemetry-store` is shared by both routes. Zustand is a lightweight state library — much less setup than Redux for a buffer and a few computed values. |
| **React SVG + Leaflet** | A hand-drawn SVG schematic on `/` shows stock heat at a glance. Leaflet on `/dashboard` gives geographic context with real map tiles. I chose not to use Chart.js — the venue maps themselves already encode all the data I need. |
| **Vitest + Playwright** | Vitest handles unit tests for data logic (stock math, event parsers). Playwright runs end-to-end tests on both routes across desktop, tablet, and phone. |
| **VitePress on GitHub Pages** | Lets me publish this case study and architecture notes as a proper site without sharing my full private notes. |

## Challenges and how I solved them

### Layout jump when KPI numbers changed

Most web fonts have proportional digits — the number "1" is physically narrower than "8". When a live counter switches between values, the varying digit widths make adjacent labels jump around. I applied `font-variant-numeric: tabular-nums` (and the equivalent Tailwind class) to every live metric: the KPI hero, gauge, zone cards, and stream rows. With tabular numbers, every digit takes up the same horizontal space, so the layout stays locked.

### Animating the buffer count without spamming React

The natural approach — storing the animation progress in React state and updating it on every frame — would trigger React's reconciliation process (the step where it compares the old and new UI trees) roughly 60 times per second. That's expensive for what is purely a display effect. For the main **Events buffered** figure, I animate with `requestAnimationFrame` (a browser API that runs code in sync with screen refreshes) and write directly to a DOM ref, bypassing React's render cycle for the display layer. React still owns the data; only the visual tick runs outside it.

### Route change flash

Without shared layout, navigating between `/` and `/dashboard` would unmount and remount everything — including the background and header — causing a visible flash. I moved both routes under `app/(main)/`, gave them a shared `AppShell`, and used `TransitionLink` with the **View Transitions API** (a browser feature for smooth page animations, ~180ms crossfade). The header and background stay put; only the page content fades.

### One ingestion path for mock and live data

Both the mock simulator and a real WebSocket feed call the same `appendEvent()` function. Parsing is handled in `parseStockEvent`; any malformed JSON frames are silently ignored. The UI shows **Simulator**, **Connecting**, **Live**, or **Offline** depending on environment variables and socket state — the same components handle all cases.

### Web Worker scope

The analytics worker runs on `/dashboard` and receives lightweight event summaries — not the full 10,000-event buffer. Sending the whole array across threads would defeat the purpose of capping memory on the main thread in the first place.

### README media on GitHub

Inline `<video>` tags with repo-relative paths don't play on github.com (a Content Security Policy restriction). I rely on the **live Vercel demo** and static PNG previews instead of embedding video.

## Accessibility passes I cared about

- `aria-label` and `aria-current` on the main nav and both venue maps  
- `aria-live="polite"` on the event stream so screen readers announce incoming rows  
- Visible `:focus-visible` rings on nav, filter pills, and list rows  
- `prefers-reduced-motion` turns off the decorative gauge scan and other non-essential animations  

## What I would add with a real backend

- An authenticated WebSocket or SSE (Server-Sent Events) feed with signed tokens — nothing secret in `NEXT_PUBLIC_*` variables  
- Server-side aggregation for multi-venue campaigns  
- Persistent incident history and post-event export  
- Rate limiting and back-pressure signals surfaced in the connection badge  

The frontend is already structured for that: typed events, a capped FIFO buffer (oldest events drop first when the limit is reached), derived snapshots, and connection state in the UI.

## Background that shaped this build

My degree covered hardware description (VHDL), Python, and deep learning — not just UI courses. That pushed me toward **measurable UI**: stable metrics, capped buffers, and maps that encode state rather than decorative charts. This is a brand ops dashboard built to stay readable under live-style data churn.

Related: [Architecture](/architecture) · [Pipeline](/pipeline) · [Current state](/current-state)
