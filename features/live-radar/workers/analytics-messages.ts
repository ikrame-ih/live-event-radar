import type { StockEvent } from "../types";
import type { ZoneThroughputSummary } from "../lib/zone-throughput";

/**
 * Worker protocol — keep payloads small and versioned-by-shape.
 * Main thread never posts the full FIFO; only a time-window sample.
 */
export type AnalyticsInMsg = {
  type: "ANALYZE_WINDOW";
  /** Trailing window sample (already clipped by the main thread). */
  events: StockEvent[];
  now: number;
  windowMs: number;
};

export type AnalyticsOutMsg =
  | { type: "THROUGHPUT"; summary: ZoneThroughputSummary }
  | { type: "ERROR"; message: string };
