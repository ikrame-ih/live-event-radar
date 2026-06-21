# Visual system & motion

CSS and component chrome only — data logic, simulator, WebSocket, and maps are unchanged.

## Design goal

Make LiveEvent Radar feel like a polished ops product on first load: soft glass panels, readable hierarchy, motion that reacts to data without getting in the way.

`/` is the Command Center (KPIs, zone inventory, SVG map, activity feed). `/dashboard` is telemetry depth (Leaflet, filters, event stream, buffer KPI).

## Visual language

The `.bry-*` prefix in `globals.css` marks internal design classes:

- **Shell** — `.bry-shell`, `.bry-glass`, lavender page background with fixed colour orbs behind the blur
- **Panels** — `.bry-box`, inset shadows; row capsules (`.bry-row-capsule`) with a subtle hover lift
- **Nav** — dock-style icons; macOS blue (`.bry-nav-icon-active`, `--accent-macos`) for active route and filter pills
- **Metrics** — `.bry-stat-big` with tabular numbers so live counters don't jump
- **Gauge** — double ring + glow sweep on `StreamGauge`; scan accent disabled under `prefers-reduced-motion`
- **Map** — polygon fills driven by stock tier; legend aligned with `zone-stock.ts`

**Fonts:** Inter, Montserrat, Plus Jakarta Sans via `next/font`. SF Pro Display when available locally.

## Glassmorphism

Three layers: body gradients and orbs on `.bry-page-shell`, semi-transparent fill (`--shell-bg: rgb(255 255 255 / 0.44)`), then `backdrop-filter: blur(36px) saturate(1.75)` on shell and nested boxes.

Key tokens: `--radius-shell` / `--radius-box` (40px / 32px), `--gradient-cta` (orange → pink), `--ease-out-soft`, `--shadow-row-hover`.

## Motion

Nav and filter pills transition in ~0.18–0.32s. New stream rows use `@keyframes row-enter` (transform only — no opacity flash). The gauge sweep runs ~0.9s via `stroke-dashoffset`. Map zone fills ease over 0.4–0.55s. Route changes crossfade through the View Transitions API (180ms, defined in `globals.css`).

`prefers-reduced-motion: reduce` turns off non-essential animation app-wide.

## Stock map tiers

| Tier | Range | Fill |
| ---- | ----- | ---- |
| Healthy | ≥ 65% | Lavender grey |
| Watch | 35–64% | Peach |
| Low | < 35% | Coral |

Same bands in `InteractiveMap.tsx`, `zone-stock.ts`, and the zone inventory cards.

## What shipped when

Tokens and base CSS came first, then `AppShell` / `AppHeader`, the gauge hero, row capsules, filters and map chrome, mobile overrides (`mobile-overrides.css`), and a QA pass (build + Vitest + Playwright). macOS polish and README hero screenshots were last.

Related: [Current state](/current-state) · [Architecture](/architecture)
