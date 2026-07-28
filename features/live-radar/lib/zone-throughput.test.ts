import { describe, expect, it } from "vitest";
import type { StockEvent } from "../types";
import {
  computeZoneThroughput,
  selectWorkerSample,
} from "./zone-throughput";

function evt(
  zone: string,
  quantity: number,
  timestamp: number
): StockEvent {
  return { zone, item: "Soda", quantity, timestamp };
}

describe("computeZoneThroughput", () => {
  it("aggregates consumption rates and flags a relative hotspot", () => {
    const now = 1_000_000;
    const events: StockEvent[] = [
      evt("South Gate", -1, now - 10_000),
      evt("Sampling Court", -5, now - 8_000),
      evt("Sampling Court", -5, now - 6_000),
      evt("Sampling Court", -5, now - 4_000),
      evt("Main Stage Walkway", -1, now - 2_000),
    ];

    const summary = computeZoneThroughput(events, now, 60_000);
    expect(summary.sampleSize).toBe(5);
    const sampling = summary.zones.find((z) => z.zone === "Sampling Court");
    expect(sampling?.consumedUnits).toBe(15);
    expect(summary.hotspotZones).toContain("Sampling Court");
  });

  it("ignores events outside the window", () => {
    const now = 1_000_000;
    const events = [evt("South Gate", -10, now - 120_000)];
    const summary = computeZoneThroughput(events, now, 60_000);
    expect(summary.sampleSize).toBe(0);
    expect(summary.hotspotZones).toEqual([]);
  });
});

describe("selectWorkerSample", () => {
  it("returns only the trailing time window and respects hardCap", () => {
    const now = 50_000;
    // Timestamps land inside [now - 10s, now] so the window filter keeps them.
    const events = Array.from({ length: 40 }, (_, i) =>
      evt("South Gate", -1, now - 9_000 + i * 200)
    );
    const sample = selectWorkerSample(events, now, 10_000, 5);
    expect(sample.length).toBe(5);
    expect(sample[0]?.timestamp).toBeGreaterThanOrEqual(now - 10_000);
  });
});
