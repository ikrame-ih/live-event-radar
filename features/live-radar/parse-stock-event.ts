import type { StockEvent } from "./types";

// Guards WebSocket JSON before it reaches the store. Returns null if shape is wrong.
export function parseStockEvent(raw: unknown): StockEvent | null {
  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;

  if (
    typeof o.zone === "string" &&
    typeof o.item === "string" &&
    typeof o.quantity === "number" &&
    typeof o.timestamp === "number"
  ) {
    return {
      zone: o.zone,
      item: o.item,
      quantity: o.quantity,
      timestamp: o.timestamp,
    };
  }

  return null;
}
