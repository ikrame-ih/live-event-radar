import { describe, expect, it } from "vitest";
import { mockStockEvent } from "./mock-event-generator";

describe("mockStockEvent", () => {
  it("returns a valid StockEvent shape", () => {
    const event = mockStockEvent();
    expect(typeof event.zone).toBe("string");
    expect(event.zone.length).toBeGreaterThan(0);
    expect(typeof event.item).toBe("string");
    expect(typeof event.quantity).toBe("number");
    expect(typeof event.timestamp).toBe("number");
  });
});
