# Engineering decisions — design trade-offs and rationale

How I chose the shape of this frontend demo — problem → options → choice → trade-off. Written for reviewers who care about judgment, not buzzwords.

## Why Next.js (App Router)?

**Problem:** Two screens (`/` and `/dashboard`) need the same header and background without remounting on every navigation.

**Options I considered:** a plain Vite SPA; Next with pages; Next App Router with a shared layout.

**Choice:** App Router + `(main)` layout so `AppShell` stays mounted and only page content swaps. Deploying the mock demo on Vercel stays simple (no custom server).

**Trade-off:** Most of the live UI is `"use client"`. That fits an interactive ops screen; it would be the wrong default for a mostly static marketing site.

## Why Zustand?

**Problem:** Both routes need the same event list without prop-drilling through the shell.

**Options:** React Context + `useReducer`; Redux Toolkit; Zustand.

**Choice:** Zustand. One `telemetry-store`, selectors where components only subscribe to what they need.

**Trade-off:** No Redux DevTools / time-travel story. For a small domain store that is a fair swap for less ceremony.

## Why a capped FIFO ring buffer?

**Problem:** A long activation (or a synthetic burst) must not grow memory without a bound. Operators care about **recent** flow for maps, ETA, and the feed.

**Options:** uncapped array; `array.push` + `slice` on every event; a fixed ring.

**Choice:** `RingBuffer` (O(1) append / drop-oldest) behind Zustand. React still gets an immutable `events` snapshot when `revision` bumps.

**Trade-off:** Snapshotting for React is still O(n) per publish. I accept that once per update instead of copying on every append. This is a **performance consideration** for the demo rates and benches — not a claim about serving millions of events in production.

## Why two map representations?

**Problem:** Coordinators need a quick “which zone is red?” answer *and* geographic context next to the raw stream.

**Options:** one map only; charts instead of maps; two maps with different jobs.

**Choice:** SVG schematic on `/` for glanceable stock heat; Leaflet on `/dashboard` for venue layout beside the list.

**Trade-off:** Two map implementations to maintain. I preferred that over charts that would only restated the same percentages.

## Why a Web Worker (and only for this)?

**Problem:** Windowed throughput / hotspot math is independent of React render and can run on a short sample.

**Options:** do everything on the main thread; move all derivation into a worker; worker for one bounded job.

**Choice:** Worker runs `computeZoneThroughput` on a **sampled trailing window** (time-clipped + hard-capped). ETA and session tally stay on the main thread — they are cheap and tied to what the UI is rendering.

**Trade-off / limits:**

- The worker does **not** own the source of truth.
- It does **not** receive the entire 10k buffer (cloning that would fight the memory cap).
- Debounced posts (~250ms) avoid flooding `postMessage` during synthetic bursts.
- This is **client-side analytics** for the demo, not a streaming analytics platform.

## Why frontend-first?

**Problem:** I wanted to show the ops idea and the frontend architecture without standing up infra for a portfolio piece.

**Options:** full stack from day one; frontend-only mock; frontend + optional live socket URL.

**Choice:** Faithful mock stream by default; optional `NEXT_PUBLIC_WS_URL` without rewriting UI.

**Possible next step (not in this repo):** a small authenticated feed (WebSocket or SSE), server aggregation for more venues, rate-limit feedback on the badge. Client types and the capped buffer already point that way.

## Why “Minutes to empty” is a heuristic

**Problem:** Showing only stock % still leaves the coordinator guessing *how soon* a stand fails.

**Choice:** `stockUnits / recentConsumptionPerMin` over ~60s.

**Limits (important):** The ETA is an **estimate from recent trend**, not a predictive model. It assumes the last minute continues, ignores upcoming restock pulses, and uses an abstract 0–100 stock level — not real SKUs. Confidence labels track how many samples we saw, not statistical significance.

## Why one restock suggestion?

**Problem:** A long list of tips is easy to ignore during an event.

**Choice:** At most one “move ~N from A → B” hint from ETA urgency + donor headroom.

**Trade-off:** It is a nudge, not a warehouse optimizer. Wrong when every zone is stressed — and the UI stays quiet then, on purpose.

## Accepted trade-offs

- CSP still allows `'unsafe-inline'` / `'unsafe-eval'` (common with Next scripts); other headers are tightened in `next.config.ts`.
- CI E2E is **desktop smoke**; tablet/phone stay local so CI stays fast.
- No auth / multi-tenant model here — scoped as a frontend demo; see SECURITY.md.

Related: [Architecture](/architecture) · [Pipeline](/pipeline) · [Benchmarks](/benchmarks) · [Technical decisions](/technical-decisions)
