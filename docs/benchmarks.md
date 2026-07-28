# Benchmarks

Small check: under synthetic bursts faster than the demo simulator (~0.5 evt/s), the capped ring still stops at `MAX_EVENTS` (10 000).

## What this is (and is not)

`npm run bench` runs `runAppendBenchmark` in Node / Vitest.

| It checks | It does **not** claim |
| --------- | --------------------- |
| Buffer length stays ≤ 10 000 after bursts | Browser FPS or React commit cost |
| Append path stays usable for synthetic 100 / 500 / 1000 evt/s payloads | Production load or multi-tab stress |
| Approx byte estimate is a rough lower bound | Accurate heap profiling |

Treat this as a **performance consideration** for the data structure — not a scalability guarantee.

## How to run

```bash
npm run bench
```

## Representative results

Run on a developer machine while writing this page. Absolute timings vary; the useful invariant is **final buffer length ≤ 10 000**.

| Target evt/s | Events in the 1s window | Final buffer length | Cap |
| ------------ | ----------------------- | ------------------- | --- |
| 100 | 100 | ≤ 10 000 | 10 000 |
| 500 | 500 | ≤ 10 000 | 10 000 |
| 1000 | 1000 | ≤ 10 000 | 10 000 |

## Why these numbers matter for the UI

- The ring overwrites oldest events when full — history is bounded on purpose.
- The worker only receives a short sample window, not the whole buffer.
- `appendEvents` exists so tests can publish batches without one React snapshot per event.

Related: [Engineering decisions — design trade-offs and rationale](/engineering-decisions) · [Pipeline](/pipeline)
