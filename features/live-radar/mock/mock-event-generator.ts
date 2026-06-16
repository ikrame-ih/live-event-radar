import type { StockEvent } from "../types";
import { ZONE_NAMES } from "../lib/derive-incidents";

const ITEMS = ["Soda", "Cap", "Sample bag"];

/** Consumption-heavy mock — stock should reach watch (35–64%) and low (<35%) tiers in demo. */
export function mockStockEvent(): StockEvent {
  const roll = Math.random();
  const zone = ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)] ?? "Zone";

  if (roll < 0.32) {
    return {
      zone,
      item: ITEMS[Math.floor(Math.random() * ITEMS.length)] ?? "Item",
      quantity: roll < 0.14 ? -5 : -3,
      timestamp: Date.now(),
    };
  }

  return {
    zone,
    item: ITEMS[Math.floor(Math.random() * ITEMS.length)] ?? "Item",
    quantity: roll > 0.42 ? -2 : -1,
    timestamp: Date.now(),
  };
}

/** Crew restock — one zone per pulse, partial refill (not a full reset on every zone). */
export function mockRestockPulse(): StockEvent[] {
  const ts = Date.now();
  const zone = ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)] ?? ZONE_NAMES[0];
  return [
    {
      zone,
      item: "Crew restock",
      quantity: 10 + Math.floor(Math.random() * 12),
      timestamp: ts,
    },
  ];
}
