# Visual system & motion

Presentation-only layer — stores, simulator, WebSocket, and map data logic unchanged.

**Status (Jun 2026):** Phases 1–8 shipped. Glass shell, row capsules, gauge glow, View Transitions, macOS active states.

## Design goal

Make LiveEvent Radar feel like a **polished operations product** on first load — soft glass UI, readable hierarchy, subtle motion.

| Route | Role |
| ----- | ---- |
| `/` | Command Center — KPIs, zone inventory, SVG map, activity |
| `/dashboard` | Telemetry — Leaflet, filters, stream, buffer KPI |

## Visual language

| Pattern | Implementation |
| ------- | -------------- |
| Floating shell | `.bry-shell`, `.bry-glass`, lavender page bg |
| Panel cards | `.bry-box`, inset shadows |
| Row capsules | `.bry-row-capsule`, hover lift |
| Nav dock | `.bry-nav-icon`, `.bry-nav-icon-active` (macOS blue) |
| KPI hero | `.bry-stat-big`, tabular nums |
| Gauge | Double ring + glow sweep (`StreamGauge`) |
| Status badges | `.bry-status-badge-*` |
| Search chrome | `.bry-search-whisper` focus ring |
| Venue map | Stock-tier polygon fills + legend |

**Fonts:** Inter, Montserrat, Plus Jakarta Sans (Google). Display stack includes SF Pro Display when available locally.

**Prefix:** `.bry-*` = internal design-system classes in `globals.css`.

## Glassmorphism

Three layers:

1. **Colour behind the panel** — body gradients + fixed orbs on `.bry-page-shell`
2. **Semi-transparent fill** — e.g. `--shell-bg: rgb(255 255 255 / 0.44)`
3. **`backdrop-filter`** — `blur(36px) saturate(1.75)` on shell and boxes

## Key tokens

| Token | Purpose |
| ----- | ------- |
| `--radius-shell` / `--radius-box` | 40px / 32px corners |
| `--gradient-cta` | Orange → pink primary actions |
| `--accent-macos` | `#0a84ff` active states |
| `--ease-out-soft` | Motion default |
| `--shadow-row-hover` | Capsule elevation |

## Motion catalogue

| ID | Interaction | Detail |
| -- | ----------- | ------ |
| M1 | Nav hover / active | `transition 0.18–0.32s` |
| M3 | Row enter | `@keyframes row-enter` (transform only) |
| M4 | Gauge sweep | `stroke-dashoffset` ~0.9s |
| M5 | Row hover lift | `translateY(-2px)` |
| M6 | Filter pill | `.bry-filter-pill-active` |
| M8 | Map zone tint | polygon fill/stroke 0.4–0.55s |
| M10 | Route crossfade | View Transitions API, 180ms |

`prefers-reduced-motion: reduce` disables non-essential animation.

## Stock map tiers

| Tier | Stock range | Fill |
| ---- | ----------- | ---- |
| Healthy | ≥ 65% | Lavender grey |
| Watch | 35–64% | Peach |
| Low | < 35% | Coral |

Aligned across `InteractiveMap.tsx`, `zone-stock.ts`, and Zone inventory cards.

## Implementation phases

1. Tokens & base CSS
2. Layout & shell (`AppShell`, `AppHeader`)
3. Gauge hero
4. Row capsules
5. Filters, badges, map chrome
6. Mobile overrides
7. QA (build, Vitest, Playwright)
8. macOS polish + route transitions + README hero showcase

Related: [Current state](/current-state) · [Architecture](/architecture)
