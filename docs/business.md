# Business problem & ROI

## The concrete problem

Working big promotions as a brand hostess, the operational pain was always the same: **information arriving too late**. A busy stand might run out of drinks or merch mid-afternoon, but central coordinators only hear about it hours later — through WhatsApp or manual head counts. There is no single live picture of which zones are draining stock fastest.

## Operational impact

1. **Stock-outs** — empty counters, frustrated guests, lost revenue.
2. **Mismatched stock** — one stand holds excess inventory while another runs dry, with no way to rebalance mid-event.

## How the product addresses it

A coordinator opens a tablet. On a simplified venue heat map, a zone flashes a warning with something like:

> *High consumption: this stand may run empty in roughly X minutes (estimate).*

The prediction doesn't need to be perfect on day one. The value is a UI that feels like **real ops telemetry** — nudging action before the gap becomes visible to guests.

## What I built (frontend scope)

This project demonstrates how real-time frontend engineering can reduce coordination latency during a live promotion:

- A **Next.js app** fed by consecutive events (mocked locally or streamed via WebSocket)
- **State** that handles rapid updates without crashing — Zustand with a FIFO buffer capped at 10,000 events (FIFO means the oldest events are discarded first when the limit is hit)
- A **venue heat map, alerts, KPIs, and event stream** that stay usable when bursts arrive

**Two screens:**

| Route | Role |
| ----- | ---- |
| `/` | Digital Command Center — SVG venue map, zone inventory, activity feed |
| `/dashboard` | Telemetry depth — Leaflet map, filters, capped event stream |

## ROI framing

| Stakeholder lens | Value |
| ---------------- | ----- |
| Brand / ops | Faster awareness of stock pressure per zone |
| Field teams | One dashboard instead of scattered messages |
| Engineering demo | Proof of capped buffers, derived state, and dual-surface maps in the browser |

## Workflow

```mermaid
flowchart LR
  A[Consumption events] --> B[Browser buffer]
  B --> C[Zone snapshots]
  C --> D[Command Center map]
  C --> E[Telemetry stream]
  D --> F[Coordinator action]
```

Next: [Architecture](/architecture) · [Data pipeline](/pipeline)
