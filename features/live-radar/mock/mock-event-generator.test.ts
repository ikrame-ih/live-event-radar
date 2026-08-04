import { describe, expect, it } from "vitest";
import {
  mockRestockPulse,
  mockSeedHistory,
  mockStockEvent,
} from "./mock-event-generator";
import { ZONE_NAMES } from "../lib/derive-incidents";

describe("mockStockEvent", () => {
  it("returns a valid StockEvent with a known zone and negative quantity", () => {
    const event = mockStockEvent(1_000);
    expect(ZONE_NAMES).toContain(event.zone);
    expect(event.item.length).toBeGreaterThan(0);
    expect(event.quantity).toBeLessThan(0);
    expect(event.timestamp).toBe(1_000);
  });
});

describe("mockRestockPulse", () => {
  it("returns a positive crew restock for one zone", () => {
    const pulse = mockRestockPulse(2_000);
    expect(pulse).toHaveLength(1);
    expect(pulse[0]?.item).toBe("Crew restock");
    expect(pulse[0]?.quantity).toBeGreaterThan(0);
    expect(pulse[0]?.timestamp).toBe(2_000);
  });
});

describe("mockSeedHistory", () => {
  it("builds a backdated series covering the duration window", () => {
    const now = 1_000_000;
    const seeded = mockSeedHistory(now, 60_000, 2_000);
    expect(seeded.length).toBeGreaterThan(20);
    expect(seeded[0]?.timestamp).toBeLessThan(now);
    expect(seeded.at(-1)?.timestamp).toBeLessThan(now);
  });
});
