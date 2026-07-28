import type { StockEvent } from "../types";
import { RingBuffer } from "./ring-buffer";
import { MAX_EVENTS } from "../constants";

export type BenchRate = 100 | 500 | 1000;

export type BenchResult = {
  ratePerSec: number;
  durationMs: number;
  eventsGenerated: number;
  appendMs: number;
  /** events / (appendMs/1000) — pure ingest throughput of the ring path. */
  appendEventsPerSec: number;
  finalBufferLength: number;
  maxBufferLength: number;
  /** Rough lower bound: events × estimated bytes / event (not heap-accurate). */
  approxBytes: number;
};

const APPROX_BYTES_PER_EVENT = 96;

/**
 * Synthetic load harness for documentation — not a browser FPS profiler.
 * Measures how fast the capped ring can absorb bursts without unbounded growth.
 */
export function runAppendBenchmark(
  ratePerSec: BenchRate,
  durationMs = 1000
): BenchResult {
  const ring = new RingBuffer<StockEvent>(MAX_EVENTS);
  const total = Math.max(1, Math.round((ratePerSec * durationMs) / 1000));
  const batchSize = Math.min(50, Math.max(1, Math.floor(ratePerSec / 20)));
  const started = performance.now();

  let generated = 0;
  while (generated < total) {
    const remaining = total - generated;
    const n = Math.min(batchSize, remaining);
    const batch: StockEvent[] = new Array(n);
    for (let i = 0; i < n; i++) {
      batch[i] = {
        zone: ZONE_ROTATE[generated % ZONE_ROTATE.length]!,
        item: "Soda",
        quantity: -1,
        timestamp: generated,
      };
      generated += 1;
    }
    ring.pushMany(batch);
  }

  const appendMs = Math.max(performance.now() - started, 0.001);

  return {
    ratePerSec,
    durationMs,
    eventsGenerated: generated,
    appendMs: Math.round(appendMs * 1000) / 1000,
    appendEventsPerSec: Math.round((generated / appendMs) * 1000),
    finalBufferLength: ring.length,
    maxBufferLength: MAX_EVENTS,
    approxBytes: ring.length * APPROX_BYTES_PER_EVENT,
  };
}

export function runAppendBenchmarkSuite(
  rates: BenchRate[] = [100, 500, 1000]
): BenchResult[] {
  return rates.map((rate) => runAppendBenchmark(rate));
}

const ZONE_ROTATE = [
  "South Gate",
  "Sampling Court",
  "Main Stage Walkway",
] as const;
