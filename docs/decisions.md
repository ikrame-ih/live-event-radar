# Decisions & challenges

How I chose the shape of this frontend — and the real problems I hit while building it.

## Why this problem

I worked brand activations as a hostess. Stock issues always showed up late — usually through WhatsApp, never through a live picture of the venue. LiveEvent Radar is my frontend answer to that: a Command Center that _feels_ like an ops dashboard, even when the data feed is simulated locally.

## Stack choices

| Choice | Why |
| ------ | --- |
| **Next.js 16 (App Router)** | Shared `(main)` layout keeps the header and background mounted while page content swaps. Vercel deploy stays simple. |
| **TypeScript** | Explicit `StockEvent` and store shapes — adding a real API later means no guesswork. |
| **Zustand** | One `telemetry-store` shared by both routes. Less ceremony than Redux for a buffer and a few derived values. |
| **React SVG + Leaflet** | Schematic SVG on `/` for glanceable stock heat; Leaflet on `/dashboard` for venue context. Maps already encode the data — no Chart.js. |
| **Vitest + Playwright** | Unit tests for stock math and parsers; Playwright across desktop, tablet, and phone. |
| **VitePress on GitHub Pages** | Case study site without sharing private notes. |

## Design trade-offs

### Why a capped FIFO ring buffer?

**Problem:** A long activation (or a synthetic burst) must not grow memory without a bound. Operators care about **recent** flow.

**In plain language:** A ring buffer is a fixed-size list that wraps around — imagine 10,000 numbered seats in a circle. When every seat is full and a new event arrives, it takes the seat of the oldest event instead of asking for a new chair. Memory never grows no matter how long the event runs, and adding an event is always one cheap write. The trade-off is that old history is gone forever, which is fine here because coordinators only act on the last few minutes.

**Choice:** `RingBuffer` (O(1) append / drop-oldest) behind Zustand. React still gets an immutable `events` snapshot when `revision` bumps.

**Trade-off:** Snapshotting for React is still O(n) per publish — paid once per update, not on every append. This is a performance consideration for demo rates and benches, not a claim about millions of events in production.

### Why Next.js App Router?

Two screens need the same shell without remounting. App Router + `(main)` layout keeps `AppShell` mounted. Most of the live UI is `"use client"` — right for an interactive ops screen, wrong for a static marketing site.

### Why a Web Worker (and only for this)?

Windowed throughput / hotspot math is independent of React render. The worker runs `computeZoneThroughput` on a **sampled trailing window** only. ETA and session tally stay on the main thread. Debounced posts (~250ms) avoid flooding `postMessage`. The worker does not own the source of truth and does not receive the full 10k buffer.

### Why two maps?

SVG schematic on `/` for “which zone is red?”; Leaflet on `/dashboard` for geographic context beside the raw stream. Two implementations to maintain — preferred over charts that would only restate the same percentages.

### Why “Minutes to empty” is a heuristic

`stockUnits / recentConsumptionPerMin` over ~60s. Assumes the last minute continues, ignores upcoming restocks, uses an abstract 0–100 stock level — not real SKUs. Confidence labels track sample count, not statistical significance.

### Why one restock suggestion?

At most one “move ~N from A → B” hint. A wall of tips gets ignored mid-event. Quiet when every zone is stressed — on purpose.

## Challenges I hit

### Layout jump when KPI numbers changed

Proportional fonts make “1” narrower than “8”, so live counters shift labels. Fixed with `font-variant-numeric: tabular-nums` via `.bry-metric` on every live metric.

### Animating the buffer count without spamming React

Storing animation progress in React state would re-render ~60 times/sec. **Events received** uses `requestAnimationFrame` and writes to a DOM ref instead.

### Six clocks, one tick

Early builds had a separate `setInterval` in each panel that needed “now”. That meant the Command Center could re-derive snapshots three times per second on three independent timers. I collapsed them into a shared `useNow` hook (`useSyncExternalStore` + one interval) so ETA, maps, and the worker sample the same clock.

### Route change flash

Moved both routes under `app/(main)/`, shared `AppShell`, and wired `TransitionLink` to the View Transitions API (~180ms crossfade).

### Stock-events list stretching the map

Feed locked to `20rem` (~5 dense rows) with internal scroll; map | feed split uses stretch so both cards share height.

### One ingestion path for mock and live data

Simulator and WebSocket both call `appendEvent()`. `parseStockEvent` guards malformed frames. Badge shows Simulator / Connecting / Live / Offline.

### README media on GitHub

Inline `<video>` with repo-relative paths does not play on github.com (CSP). Static PNG previews + the live Vercel demo instead. External hosted mp4 / GIF works when you want motion.

## Accessibility

- `aria-label` / `aria-current` on nav and maps
- `aria-live="polite"` on the event stream
- Visible `:focus-visible` on interactive controls
- `prefers-reduced-motion` disables decorative motion
- Venue SVG uses `role="group"` so nested zone buttons stay reachable to assistive tech

## Accepted trade-offs

- CSP keeps `'unsafe-inline'` for scripts/styles because Next.js still injects inline bootstrap scripts. A nonce pipeline would remove that. `'unsafe-eval'` is omitted. `connect-src` is `'self' | ws: | wss:` only.
- CI E2E is desktop smoke; tablet/phone stay local.
- No auth / multi-tenant model — frontend demo scope; see SECURITY.md.

## What I'd add with a real backend

Authenticated feed (WebSocket or SSE), server-side aggregation for multiple venues, clearer rate-limit feedback on the badge. Nothing secret in `NEXT_PUBLIC_*`. Client types and the capped buffer already point that way.

Working promotions taught me that a dashboard only helps if the numbers stay trustworthy. Python from my degree plus ops experience pushed me toward stable KPIs, capped buffers, and maps that show stock state — not decorative charts.

See also [Architecture](/architecture) · [Pipeline](/pipeline) · [Benchmarks](/benchmarks) · [Lessons learned](/lessons-learned)
