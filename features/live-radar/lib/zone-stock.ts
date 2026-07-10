import type { StockEvent } from "../types";
import { ZONE_NAMES, countByZone } from "./derive-incidents";

export const STOCK_MAX = 100;
export const REPLENISH_INTERVAL_MS = 60_000;
/** Map legend thresholds — drives SVG/Leaflet fill colours */
export const STOCK_TIER_HEALTHY_MIN = 65;
export const STOCK_TIER_WATCH_MIN = 35;
const STOCK_WINDOW_MS = 120_000;
const IDLE_RECOVERY_MS = 40_000;
const RECOVERY_PER_SEC = 1;

export type ZoneStatus = "healthy" | "watch" | "critical";

export type ZoneSnapshot = {
  zone: string;
  stock: number;
  demand30s: number;
  spikes15s: number;
  lastItem: string | null;
  lastQuantity: number | null;
  status: ZoneStatus;
  subtitle: string;
};

export const ZONE_META: Record<
  string,
  { short: string; subtitle: string; stands: number }
> = {
  "South Gate": { short: "SG", subtitle: "Entry · 3 stands", stands: 3 },
  "Sampling Court": {
    short: "SC",
    subtitle: "Activation · 6 stands",
    stands: 6,
  },
  "Main Stage Walkway": {
    short: "MSW",
    subtitle: "Flow corridor · 2 stands",
    stands: 2,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function resolveStatus(stock: number, spikes15s: number): ZoneStatus {
  // Inventory card pills — tighter bands than map heat tiers above.
  if (stock < 30 || spikes15s >= 2) return "critical";
  if (stock < 55 || spikes15s >= 1) return "watch";
  return "healthy";
}

function applyEventDeltas(
  events: StockEvent[],
  windowStart: number,
  stock: Map<string, number>,
  lastByZone: Map<string, StockEvent>
): void {
  const chronological = events
    .filter((event) => event.timestamp >= windowStart)
    .sort((left, right) => left.timestamp - right.timestamp);

  for (const event of chronological) {
    if (!stock.has(event.zone)) continue;
    stock.set(
      event.zone,
      clamp((stock.get(event.zone) ?? STOCK_MAX) + event.quantity, 0, STOCK_MAX)
    );
    lastByZone.set(event.zone, event);
  }
}

function applyIdleRecovery(
  stock: Map<string, number>,
  lastByZone: Map<string, StockEvent>,
  now: number
): void {
  for (const zone of ZONE_NAMES) {
    const last = lastByZone.get(zone);
    const idleMs = last ? now - last.timestamp : STOCK_WINDOW_MS;
    if (idleMs <= IDLE_RECOVERY_MS) continue;

    const recoverySecs = (idleMs - IDLE_RECOVERY_MS) / 1000;
    stock.set(
      zone,
      clamp(
        (stock.get(zone) ?? STOCK_MAX) + recoverySecs * RECOVERY_PER_SEC,
        0,
        STOCK_MAX
      )
    );
  }
}

function snapshotForZone(
  zone: string,
  events: StockEvent[],
  stock: Map<string, number>,
  lastByZone: Map<string, StockEvent>,
  demand: Map<string, number>,
  now: number,
  spikeCutoff: number
): ZoneSnapshot {
  const zoneEvents = events.filter(
    (event) => event.zone === zone && event.timestamp >= now - 30_000
  );
  const spikes15s = zoneEvents.filter(
    (event) => event.timestamp >= spikeCutoff && event.quantity <= -2
  ).length;
  const last = lastByZone.get(zone) ?? null;
  const level = Math.round(stock.get(zone) ?? STOCK_MAX);

  return {
    zone,
    stock: level,
    demand30s: demand.get(zone) ?? 0,
    spikes15s,
    lastItem: last?.item ?? null,
    lastQuantity: last?.quantity ?? null,
    status: resolveStatus(level, spikes15s),
    subtitle: ZONE_META[zone]?.subtitle ?? zone,
  };
}

/** Recent events + idle drift back toward 100% */
export function deriveZoneSnapshots(
  events: StockEvent[],
  now = Date.now()
): ZoneSnapshot[] {
  const windowStart = now - STOCK_WINDOW_MS;
  const stock = new Map<string, number>(ZONE_NAMES.map((zone) => [zone, STOCK_MAX]));
  const lastByZone = new Map<string, StockEvent>();

  applyEventDeltas(events, windowStart, stock, lastByZone);
  applyIdleRecovery(stock, lastByZone, now);

  const demand = countByZone(events, 30_000);
  const spikeCutoff = now - 15_000;

  return ZONE_NAMES.map((zone) =>
    snapshotForZone(zone, events, stock, lastByZone, demand, now, spikeCutoff)
  );
}

export function stockHeat(stock: number): "cool" | "mid" | "hot" {
  if (stock >= STOCK_TIER_HEALTHY_MIN) return "cool";
  if (stock >= STOCK_TIER_WATCH_MIN) return "mid";
  return "hot";
}

export type StockHeat = ReturnType<typeof stockHeat>;

export function zoneStatusCaption(snap: ZoneSnapshot): string {
  const lowStock = snap.stock < 35;
  const watchStock = snap.stock < 65;

  if (lowStock) return "Low stock";
  if (snap.spikes15s >= 2) return "High demand";
  if (snap.spikes15s >= 1) return "Elevated demand";
  if (watchStock) return "Watch stock";
  return "Healthy";
}
