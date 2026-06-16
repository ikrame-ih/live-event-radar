import { describe, expect, it } from "vitest";
import { deriveIncidents } from "./derive-incidents";
import type { StockEvent } from "../types";

function fakeEvent(
  zone: string,
  quantity: number,
  offsetMs: number,
): StockEvent {
  return {
    zone,
    item: "Soda",
    quantity,
    timestamp: Date.now() - offsetMs,
  };
}

describe("deriveIncidents", () => {
  it("returns empty when no recent events", () => {
    expect(deriveIncidents([])).toEqual([]);
  });

  it("creates zone rollup when events exist in window", () => {
    const events = [
      fakeEvent("South Gate", -1, 1000),
      fakeEvent("South Gate", -2, 500),
    ];
    const result = deriveIncidents(events);
    expect(result.some((i) => i.zone === "South Gate")).toBe(true);
    expect(result.some((i) => i.metric.includes("evt/30s"))).toBe(true);
  });

  it("flags critical severity on heavy spike activity", () => {
    const events = [
      fakeEvent("Sampling Court", -2, 1000),
      fakeEvent("Sampling Court", -2, 2000),
      fakeEvent("Sampling Court", -2, 3000),
    ];
    const result = deriveIncidents(events);
    const rollup = result.find((i) => i.id === "zone-Sampling Court");
    expect(rollup?.severity).toBe("critical");
  });

  it("returns at most one rollup per zone (no overlapping map nodes)", () => {
    const events = Array.from({ length: 20 }, (_, i) =>
      fakeEvent("South Gate", -2, i * 500),
    );
    const result = deriveIncidents(events);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("zone-South Gate");
  });
});
