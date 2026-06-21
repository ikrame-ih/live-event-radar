import type { StockEvent } from "./types";

const MAX_FIELD_LEN = 256;

// Validates WebSocket JSON before appendEvent. Returns null on bad shape.
export function parseStockEvent(raw: unknown): StockEvent | null {
  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;

  if (
    typeof o.zone === "string" &&
    typeof o.item === "string" &&
    typeof o.quantity === "number" &&
    typeof o.timestamp === "number" &&
    o.zone.length > 0 &&
    o.zone.length <= MAX_FIELD_LEN &&
    o.item.length > 0 &&
    o.item.length <= MAX_FIELD_LEN &&
    Number.isFinite(o.quantity) &&
    Number.isFinite(o.timestamp)
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
