# Visual system & motion

The presentation layer only — all data logic, simulator, WebSocket, and maps are unchanged.

**Status (Jun 2026):** Phases 1–8 shipped. Glass shell, row capsules, gauge glow, View Transitions, macOS active states.

## Design goal

Make LiveEvent Radar feel like a **polished operations product** on first load — soft glass panels, readable hierarchy, and subtle motion that reacts to data without distracting from it.

| Route | Role |
| ----- | ---- |
| `/` | Command Center — KPIs, zone inventory, SVG map, activity feed |
| `/dashboard` | Telemetry — Leaflet map, filters, event stream, buffer KPI |

## Visual language

| Pattern | Implementation |
| ------- | -------------- |
| Floating shell | `.bry-shell`, `.bry-glass`, lavender page background |
| Panel cards | `.bry-box`, inset shadows |
| Row capsules | `.bry-row-capsule`, subtle hover lift |
| Nav dock | `.bry-nav-icon`, `.bry-nav-icon-active` (macOS blue) |
| KPI hero | `.bry-stat-big`, tabular numbers (all digits same width) |
| Stream gauge | Double ring + glow sweep (`StreamGauge`) |
| Status badges | `.bry-status-badge-*` |
| Search chrome | `.bry-search-whisper` focus ring |
| Venue map | Stock-tier polygon fills + legend |

**Fonts:** Inter, Montserrat, Plus Jakarta Sans (loaded from Google Fonts). SF Pro Display is used when available locally (macOS).

**Prefix:** `.bry-*` marks internal design-system classes defined in `globals.css`.

## Glassmorphism

Three layers stack to create the frosted glass look:

1. **Colour behind the panel** — body gradients and fixed orbs on `.bry-page-shell`
2. **Semi-transparent fill** — e.g. `--shell-bg: rgb(255 255 255 / 0.44)`
3. **`backdrop-filter`** — `blur(36px) saturate(1.75)` on the shell and nested boxes

## Key tokens

| Token | Purpose |
| ----- | ------- |
| `--radius-shell` / `--radius-box` | 40px / 32px corner radii |
| `--gradient-cta` | Orange → pink for primary actions |
| `--accent-macos` | `#0a84ff` for active nav and filter states |
| `--ease-out-soft` | Default easing curve for transitions |
| `--shadow-row-hover` | Elevation shadow on capsule hover |

## Motion catalogue

| ID | Interaction | Detail |
| -- | ----------- | ------ |
| M1 | Nav hover / active | `transition 0.18–0.32s` |
| M3 | Row enter | `@keyframes row-enter` (transform only, no opacity flash) |
| M4 | Gauge sweep | `stroke-dashoffset` animates over ~0.9s |
| M5 | Row hover lift | `translateY(-2px)` |
| M6 | Filter pill | `.bry-filter-pill-active` |
| M8 | Map zone tint | Polygon fill and stroke transition 0.4–0.55s |
| M10 | Route crossfade | View Transitions API, 180ms fade between pages |
| M11 | Gauge scan accent | `.bry-gauge-scanline` on `StreamGauge` — a subtle sweep animation, turned off when the user has `prefers-reduced-motion` enabled |

`prefers-reduced-motion: reduce` disables all non-essential animations throughout the app.

## Stock map tiers

| Tier | Stock range | Fill |
| ---- | ----------- | ---- |
| Healthy | ≥ 65% | Lavender grey |
| Watch | 35–64% | Peach |
| Low | < 35% | Coral |

These colours are consistent across `InteractiveMap.tsx`, `zone-stock.ts`, and the Zone inventory cards.

## Implementation phases

1. Design tokens and base CSS
2. Layout and shell (`AppShell`, `AppHeader`)
3. Gauge hero component
4. Row capsules
5. Filters, badges, map chrome
6. Mobile overrides
7. QA — build, Vitest, Playwright
8. macOS polish, route transitions, README hero screenshots

Related: [Current state](/current-state) · [Architecture](/architecture)
