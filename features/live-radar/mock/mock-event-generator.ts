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
export function mockStockEvent(at = Date.now()): StockEvent {
  const roll = Math.random();
  const zone = pickZone();

  if (roll < 0.32) {
    return {
      zone,
      item: pickItem(),
      quantity: spikeQuantity(roll),
      timestamp: at,
    };
  }

  return {
    zone,
    item: pickItem(),
    quantity: normalQuantity(roll),
    timestamp: at,
  };
}

/** One zone per pulse — partial refill, not a full reset */
export function mockRestockPulse(at = Date.now()): StockEvent[] {
  const timestamp = at;
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

/**
 * Backdated history so the UI opens mid-event (Watch/Low tiers visible).
 * ~3 minutes of ticks at SIMULATOR_TICK_MS spacing, plus a couple of restocks.
 */
export function mockSeedHistory(
  now = Date.now(),
  durationMs = 180_000,
  tickMs = 2000
): StockEvent[] {
  const events: StockEvent[] = [];
  for (let t = now - durationMs; t < now; t += tickMs) {
    events.push(mockStockEvent(t));
    // Occasional restock pulse roughly every 60s in the seed window
    if ((t - (now - durationMs)) % 60_000 < tickMs) {
      events.push(...mockRestockPulse(t + 1));
    }
  }
  return events;
}
