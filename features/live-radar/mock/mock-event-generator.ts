import type { StockEvent } from "../types";
import { ZONE_NAMES } from "../lib/derive-incidents";

const ITEMS = ["Soda", "Cap", "Sample bag"];

export function mockStockEvent(): StockEvent {
  const roll = Math.random();
  const zone = ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)] ?? "Zone";

  if (roll > 0.92) {
    return {
      zone,
      item: "Restock run",
      quantity: 8 + Math.floor(Math.random() * 10),
      timestamp: Date.now(),
    };
  }

  return {
    zone,
    item: ITEMS[Math.floor(Math.random() * ITEMS.length)] ?? "Item",
    quantity: roll > 0.55 ? -1 : -2,
    timestamp: Date.now(),
  };
}

/** Crew restock pulse — one event per zone, used on a fixed interval. */
export function mockRestockPulse(): StockEvent[] {
  const ts = Date.now();
  return ZONE_NAMES.map((zone) => ({
    zone,
    item: "Crew restock",
    quantity: 22 + Math.floor(Math.random() * 18),
    timestamp: ts,
  }));
}
