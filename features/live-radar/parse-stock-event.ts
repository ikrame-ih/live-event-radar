import type { StockEvent } from "./types";

const MAX_FIELD_LEN = 256;

// Validates WebSocket JSON before appendEvent. Returns null on bad shape.
export function parseStockEvent(raw: unknown): StockEvent | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;

  if (
    typeof payload.zone === "string" &&
    typeof payload.item === "string" &&
    typeof payload.quantity === "number" &&
    typeof payload.timestamp === "number" &&
    payload.zone.length > 0 &&
    payload.zone.length <= MAX_FIELD_LEN &&
    payload.item.length > 0 &&
    payload.item.length <= MAX_FIELD_LEN &&
    Number.isFinite(payload.quantity) &&
    Number.isFinite(payload.timestamp)
  ) {
    return {
      zone: payload.zone,
      item: payload.item,
      quantity: payload.quantity,
      timestamp: payload.timestamp,
    };
  }

  return null;
}
