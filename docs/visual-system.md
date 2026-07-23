# Visual system & motion

CSS and component chrome only — data logic, simulator, WebSocket, and maps are unchanged.

## Design goal

Make LiveEvent Radar feel like a polished ops product on first load: soft glass panels, readable hierarchy, motion that reacts to data without getting in the way.

`/` is the Command Center (KPIs, zone inventory, SVG map, Session tally). `/dashboard` is telemetry depth (Leaflet, filters, event stream, buffer KPI).

## Visual language

The `.bry-*` prefix in `globals.css` marks internal design classes:

- **Shell** — `.bry-shell`, `.bry-glass`, warm lavender page background with coral-tinted orbs behind the blur
- **Panels** — `.bry-box`, inset shadows; row capsules (`.bry-row-capsule`) with a subtle hover lift
- **Nav** — two dock icons only (Command Center · Live dashboard); coral (`.bry-nav-icon-active`, `--semantic-coral`) for the active route; cool blue (`--accent`) for live/CTA chrome and filter pills. No separate map-hash icon — maps live on each route.
- **Metrics** — `.bry-stat-big` / `.bry-metric` with tabular numbers so live counters don't jump
- **Gauge** — double ring + glow sweep on `StreamGauge`; scan accent disabled under `prefers-reduced-motion`
- **Map** — polygon fills driven by stock tier; legend aligned with `zone-stock.ts` / `stock-heat-colors.ts`
- **Zone stock** — inventory cards with plain-language status (“See which stands are running low”)
- **Session tally** — ledger of Taken out / Put back / Net + per-zone table (share of out, stock now); End event freezes; Copy for WhatsApp; row select uses soft accent wash (no coral rail) and focuses the SVG map
- **Stock events (`/dashboard`)** — split layout (map | feed); equal-height cards (bottoms aligned); dense rows; feed locked to **20rem (~5 rows)** with internal scroll; search by zone or product; selection is per event row (not whole zone)

## Typography

Roles (CSS variables in `:root`):

| Role | Variable | Use |
| ---- | -------- | --- |
| UI | `--font-ui` | Body, captions (Inter → Jakarta) |
| Heading | `--font-heading` | Section titles, card titles, brand mark (Montserrat) |
| Display | `--font-display` | Large KPI figures |
| Metric | `--font-metric` | Live digits (`.bry-metric`, tabular-nums) |
| Label | `--font-label` | Uppercase micro-labels (`.bry-caps`, pills) — Montserrat/Jakarta |

Loaded via `next/font`: Inter, Montserrat, Plus Jakarta Sans. SF Pro Display / Proxima Nova when installed locally.

**Alignment:** `.bry-section-head` uses `align-items: flex-start` so title blocks and meta pills share a top edge. Subtitles (`.bry-section-subtitle`) are `0.8125rem` / `--text-secondary` for scanability. Card and activity titles use `.bry-card-title`; the header brand uses `.bry-brand-mark`.

## Glassmorphism

Three layers: body gradients and orbs on `.bry-page-shell`, semi-transparent fill (`--shell-bg: rgb(255 255 255 / 0.44)`), then `backdrop-filter: blur(36px) saturate(1.75)` on shell and nested boxes.

Key tokens: `--radius-shell` / `--radius-box` (40px / 32px), `--gradient-cta` (cool ops blue), `--ease-out-soft`, `--shadow-row-hover`.

## Motion

Nav and filter pills transition in ~0.18–0.32s. New stream rows use `@keyframes row-enter` (transform only — no opacity flash). The gauge sweep runs ~0.9s via `stroke-dashoffset`. Map zone fills ease over 0.4–0.55s. Route changes crossfade through the View Transitions API (180ms, defined in `globals.css`).

`prefers-reduced-motion: reduce` turns off non-essential animation app-wide.

## Stock map tiers

Map fill colours use **65% / 35%** bands (`STOCK_TIER_*` in `zone-stock.ts`). Palette in `stock-heat-colors.ts`:

| Tier    | Range  | Fill / stroke     |
| ------- | ------ | ----------------- |
| Healthy | ≥ 65%  | Teal soft / teal  |
| Watch   | 35–64% | Amber soft / amber |
| Low     | < 35%  | Coral soft / coral |

Same bands in `InteractiveMap.tsx`, Leaflet markers, and the zone inventory cards.

## Inventory status pills

Zone health **status** labels use tighter rules (30% / 55% stock plus spike counts) — so a zone can show “Watch” on the card while the map fill is still mid-tier. Both models live in `zone-stock.ts`.

## What shipped when

Tokens and base CSS came first, then `AppShell` / `AppHeader`, the gauge hero, row capsules, filters and map chrome, mobile overrides (`mobile-overrides.css`), and a QA pass (build + Vitest + Playwright). Later: coral ambient + nav, typography utilities, dashboard split with capped stream scroll, two-icon nav, plain-language section copy (Zone stock, Session tally, Stock events, Live dashboard), and Session tally with End event freeze.

Related: [Current state](/current-state) · [Architecture](/architecture)
