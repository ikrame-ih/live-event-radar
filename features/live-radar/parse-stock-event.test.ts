import { describe, expect, it } from "vitest";
import { parseStockEvent } from "./parse-stock-event";

describe("parseStockEvent", () => {
  it("returns a StockEvent when all fields are valid", () => {
    const raw = {
      zone: "South Gate",
      item: "Soda",
      quantity: -2,
      timestamp: 1715954400000,
    };
    expect(parseStockEvent(raw)).toEqual(raw);
  });

  it("returns null for missing or wrong types", () => {
    expect(parseStockEvent(null)).toBeNull();
    expect(parseStockEvent("not-json")).toBeNull();
    expect(
      parseStockEvent({ zone: "A", item: "B", quantity: "-1", timestamp: 1 })
    ).toBeNull();
    expect(parseStockEvent({ zone: "A", item: "B" })).toBeNull();
  });
});
