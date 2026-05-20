import type { StockEvent } from "../types";

const ZONES = ["Entrance", "North stand", "Main stage"];
const ITEMS = ["Water", "Soda", "Cap"];

export function mockStockEvent(): StockEvent {
  return {
    timestamp: Date.now(),
    zone: ZONES[Math.floor(Math.random() * ZONES.length)] ?? "Zone",
    item: ITEMS[Math.floor(Math.random() * ITEMS.length)] ?? "Item",
    quantity: Math.random() > 0.5 ? -1 : -2,
  };
}