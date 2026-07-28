import type { StockEvent } from "../types";
import { STOCK_MAX } from "./zone-stock";

/** Recent window for rate estimation — matches the "current rush" a coordinator feels. */
export const ETA_WINDOW_MS = 60_000;
/**
 * Below this consumption rate we refuse to project an ETA.
 * Avoids "∞ minutes" noise and false urgency when a zone is idle.
 */
export const ETA_MIN_RATE_PER_MIN = 0.8;
/** Cap displayed ETA so wild extrapolations don't look like precision. */
export const ETA_MAX_MINUTES = 180;

export type MinutesUntilEmpty = {
  zone: string;
  stockPercent: number;
  /** Units consumed per minute in the ETA window (absolute). */
  ratePerMin: number;
  /**
   * Approximate minutes until stock hits 0 at the recent rate.
   * `null` = insufficient demand to project (not "safe forever").
   */
  minutes: number | null;
  confidence: "low" | "medium" | "high";
};

/**
 * Operational heuristic — not ML.
 *
 * minutes ≈ stockUnits / consumptionRatePerMin
 *
 * Limitations (document in UI/docs):
 * - Assumes the last ETA_WINDOW_MS pace continues (no schedule, weather, or crew model).
 * - Ignores pending restock pulses from the simulator.
 * - Stock is a 0–STOCK_MAX abstract level, not SKU-accurate inventory.
 */
export function estimateMinutesUntilEmpty(
  zone: string,
  stockPercent: number,
  events: readonly StockEvent[],
  now = Date.now(),
  windowMs = ETA_WINDOW_MS
): MinutesUntilEmpty {
  const cutoff = now - windowMs;
  let consumedUnits = 0;
  let consumptionEvents = 0;

  for (const event of events) {
    if (event.zone !== zone || event.timestamp < cutoff) continue;
    if (event.quantity >= 0) continue;
    consumedUnits += -event.quantity;
    consumptionEvents += 1;
  }

  const windowMinutes = windowMs / 60_000;
  const ratePerMin = consumedUnits / windowMinutes;
  const stockUnits = (clamp(stockPercent, 0, 100) / 100) * STOCK_MAX;

  if (stockUnits <= 0) {
    return {
      zone,
      stockPercent,
      ratePerMin: round1(ratePerMin),
      minutes: 0,
      confidence: "high",
    };
  }

  if (ratePerMin < ETA_MIN_RATE_PER_MIN) {
    return {
      zone,
      stockPercent,
      ratePerMin: round1(ratePerMin),
      minutes: null,
      confidence: "low",
    };
  }

  const rawMinutes = stockUnits / ratePerMin;
  const minutes = Math.min(ETA_MAX_MINUTES, Math.max(0, Math.round(rawMinutes)));

  // More consumption samples in the window → slightly higher confidence label.
  const confidence =
    consumptionEvents >= 8 ? "high" : consumptionEvents >= 3 ? "medium" : "low";

  return {
    zone,
    stockPercent,
    ratePerMin: round1(ratePerMin),
    minutes,
    confidence,
  };
}

export function formatEtaLabel(eta: MinutesUntilEmpty): string {
  if (eta.minutes === null) return "Stable pace";
  if (eta.minutes === 0) return "Empty now";
  if (eta.minutes === 1) return "~1 min to empty";
  if (eta.minutes >= ETA_MAX_MINUTES) return `>~${ETA_MAX_MINUTES} min`;
  return `~${eta.minutes} min to empty`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
