import { ZONE_NAMES } from "./derive-incidents";
import type { StockEvent } from "../types";

export type ZoneSessionTally = {
  zone: string;
  consumed: number;
  restocked: number;
  net: number;
  eventCount: number;
};

export type SessionTally = {
  zones: ZoneSessionTally[];
  totals: {
    consumed: number;
    restocked: number;
    net: number;
    eventCount: number;
  };
};

export type DeriveSessionTallyOptions = {
  /** Inclusive lower bound (ms). Events before this are ignored. */
  startedAt: number;
  /** Inclusive upper bound (ms). When set, freezes the window. */
  endedAt?: number | null;
  /**
   * Optional live upper bound when endedAt is null.
   * Prefer omitting this in React render — live defaults to an open window.
   */
  now?: number;
};

/**
 * Session totals from the event buffer — WhatsApp-ready out/in/net per zone.
 * Consumed = sum(|q|) for q < 0 · Restocked = sum(q) for q > 0 · Net = restocked − consumed
 */
export function deriveSessionTally(
  events: readonly StockEvent[],
  options: DeriveSessionTallyOptions
): SessionTally {
  const end = options.endedAt ?? options.now ?? Number.MAX_SAFE_INTEGER;
  const start = options.startedAt;

  const byZone = new Map<string, ZoneSessionTally>();
  for (const zone of ZONE_NAMES) {
    byZone.set(zone, {
      zone,
      consumed: 0,
      restocked: 0,
      net: 0,
      eventCount: 0,
    });
  }

  for (const event of events) {
    if (event.timestamp < start || event.timestamp > end) continue;
    const row = byZone.get(event.zone);
    if (!row) continue;

    row.eventCount += 1;
    if (event.quantity < 0) {
      row.consumed += Math.abs(event.quantity);
    } else if (event.quantity > 0) {
      row.restocked += event.quantity;
    }
  }

  const zones = ZONE_NAMES.map((zone) => {
    const row = byZone.get(zone)!;
    row.net = row.restocked - row.consumed;
    return row;
  });

  const totals = zones.reduce(
    (acc, row) => {
      acc.consumed += row.consumed;
      acc.restocked += row.restocked;
      acc.net += row.net;
      acc.eventCount += row.eventCount;
      return acc;
    },
    { consumed: 0, restocked: 0, net: 0, eventCount: 0 }
  );

  return { zones, totals };
}
