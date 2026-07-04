import type { StockEvent } from "../types";
import { ZONE_NAMES } from "../lib/derive-incidents";

const ITEMS = ["Soda", "Cap", "Sample bag"];

function pickZone(): string {
  return ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)] ?? "Zone";
}

function pickItem(): string {
  return ITEMS[Math.floor(Math.random() * ITEMS.length)] ?? "Item";
}

function spikeQuantity(roll: number): number {
  return roll < 0.14 ? -5 : -3;
}

function normalQuantity(roll: number): number {
  return roll > 0.42 ? -2 : -1;
}

/** Tuned so watch/low tiers show up during a short demo */
export function mockStockEvent(): StockEvent {
  const roll = Math.random();
  const zone = pickZone();

  if (roll < 0.32) {
    return {
      zone,
      item: pickItem(),
      quantity: spikeQuantity(roll),
      timestamp: Date.now(),
    };
  }

  return {
    zone,
    item: pickItem(),
    quantity: normalQuantity(roll),
    timestamp: Date.now(),
  };
}

/** One zone per pulse — partial refill, not a full reset */
export function mockRestockPulse(): StockEvent[] {
  const timestamp = Date.now();
  const zone = pickZone();
  return [
    {
      zone,
      item: "Crew restock",
      quantity: 10 + Math.floor(Math.random() * 12),
      timestamp,
    },
  ];
}
