import { describe, expect, it } from "vitest";
import { MAX_EVENTS } from "../constants";
import { runAppendBenchmark, runAppendBenchmarkSuite } from "./bench-telemetry";

describe("runAppendBenchmark", () => {
  it("keeps the buffer capped while absorbing a high-rate burst", () => {
    const result = runAppendBenchmark(1000, 1000);
    expect(result.eventsGenerated).toBe(1000);
    expect(result.finalBufferLength).toBeLessThanOrEqual(MAX_EVENTS);
    expect(result.appendEventsPerSec).toBeGreaterThan(1000);
  });

  it("returns one row per requested rate", () => {
    const suite = runAppendBenchmarkSuite([100, 500]);
    expect(suite.map((row) => row.ratePerSec)).toEqual([100, 500]);
  });
});
