import type { StockEvent } from "../types";
import { REPLENISH_INTERVAL_MS } from "./zone-stock";

const RESTOCK_ITEM = "Crew restock";

/** Milliseconds until the next scheduled crew restock pulse. */
export function msUntilNextRestock(
  events: StockEvent[],
  now = Date.now(),
): number {
  const lastRestock = events
    .filter((e) => e.item === RESTOCK_ITEM)
    .reduce((max, e) => Math.max(max, e.timestamp), 0);

  if (lastRestock === 0) {
    return REPLENISH_INTERVAL_MS;
  }

  const elapsed = now - lastRestock;
  const remainder = REPLENISH_INTERVAL_MS - (elapsed % REPLENISH_INTERVAL_MS);
  return remainder === 0 ? REPLENISH_INTERVAL_MS : remainder;
}

export function formatRestockCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
