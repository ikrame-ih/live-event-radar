import type { StockEvent } from "../types";
import { ZONE_NAMES } from "./derive-incidents";

/** Default analysis window — short enough to feel "live", long enough to smooth noise. */
export const THROUGHPUT_WINDOW_MS = 60_000;

/**
 * Hotspot = zone consuming faster than peers in the same window.
 * Relative threshold avoids hard-coding venue-specific rates for the demo.
 */
export const HOTSPOT_RATE_MULTIPLIER = 1.35;
/** Ignore relative hotspots when the venue is nearly idle. */
export const HOTSPOT_MIN_RATE_PER_MIN = 2;

export type ZoneThroughput = {
  zone: string;
  eventCount: number;
  consumedUnits: number;
  restockedUnits: number;
  /** Absolute consumption units per minute inside the window. */
  ratePerMin: number;
  isHotspot: boolean;
};

export type ZoneThroughputSummary = {
  windowMs: number;
  processedAt: number;
  /** How many events the worker actually inspected (never the full FIFO). */
  sampleSize: number;
  zones: ZoneThroughput[];
  hotspotZones: string[];
};

/**
 * Pure throughput / hotspot derivation.
 *
 * Kept free of Worker APIs so Vitest can assert behaviour on the main thread;
 * the worker file is a thin message adapter around this function.
 */
export function computeZoneThroughput(
  events: readonly StockEvent[],
  now = Date.now(),
  windowMs = THROUGHPUT_WINDOW_MS
): ZoneThroughputSummary {
  const cutoff = now - windowMs;
  const windowMinutes = windowMs / 60_000;

  const stats = new Map<
    string,
    { eventCount: number; consumedUnits: number; restockedUnits: number }
  >(
    ZONE_NAMES.map((zone) => [
      zone,
      { eventCount: 0, consumedUnits: 0, restockedUnits: 0 },
    ])
  );

  let sampleSize = 0;
  for (const event of events) {
    if (event.timestamp < cutoff) continue;
    const row = stats.get(event.zone);
    if (!row) continue;
    sampleSize += 1;
    row.eventCount += 1;
    if (event.quantity < 0) {
      row.consumedUnits += -event.quantity;
    } else if (event.quantity > 0) {
      row.restockedUnits += event.quantity;
    }
  }

  const rates = ZONE_NAMES.map((zone) => {
    const row = stats.get(zone)!;
    return row.consumedUnits / windowMinutes;
  });
  const meanRate =
    rates.reduce((sum, rate) => sum + rate, 0) / Math.max(rates.length, 1);

  const zones: ZoneThroughput[] = ZONE_NAMES.map((zone, index) => {
    const row = stats.get(zone)!;
    const ratePerMin = rates[index]!;
    const isHotspot =
      ratePerMin >= HOTSPOT_MIN_RATE_PER_MIN &&
      ratePerMin >= meanRate * HOTSPOT_RATE_MULTIPLIER;

    return {
      zone,
      eventCount: row.eventCount,
      consumedUnits: row.consumedUnits,
      restockedUnits: row.restockedUnits,
      ratePerMin: Math.round(ratePerMin * 10) / 10,
      isHotspot,
    };
  });

  return {
    windowMs,
    processedAt: now,
    sampleSize,
    zones,
    hotspotZones: zones.filter((z) => z.isHotspot).map((z) => z.zone),
  };
}

/**
 * Cap how many trailing events we ship to the worker.
 * At demo rates (~0.5/s) 60s ≈ 30 events; under bench spikes we still bound
 * structured-clone cost instead of cloning the entire 10k FIFO.
 */
export function selectWorkerSample(
  events: readonly StockEvent[],
  now: number,
  windowMs = THROUGHPUT_WINDOW_MS,
  hardCap = 500
): StockEvent[] {
  const cutoff = now - windowMs;
  const sample: StockEvent[] = [];
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i]!;
    if (event.timestamp < cutoff) break;
    sample.push(event);
    if (sample.length >= hardCap) break;
  }
  sample.reverse();
  return sample;
}
