/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StockEvent } from "../types";
import { useAnalyticsWorker } from "./use-analytics-worker";

type MockWorker = {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
};

let lastWorker: MockWorker | null = null;

beforeEach(() => {
  lastWorker = null;
  vi.useFakeTimers();
  vi.stubGlobal(
    "Worker",
    vi.fn().mockImplementation(function WorkerMock() {
      const worker: MockWorker = {
        onmessage: null,
        onerror: null,
        postMessage: vi.fn(),
        terminate: vi.fn(),
      };
      lastWorker = worker;
      return worker;
    })
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const sample: StockEvent[] = [
  {
    zone: "South Gate",
    item: "Soda",
    quantity: -2,
    timestamp: Date.now() - 1_000,
  },
];

describe("useAnalyticsWorker", () => {
  it("debounces postMessage and applies THROUGHPUT summaries", async () => {
    const { result } = renderHook(() =>
      useAnalyticsWorker(sample, Date.now())
    );

    expect(lastWorker?.postMessage).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(lastWorker?.postMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      lastWorker?.onmessage?.({
        data: {
          type: "THROUGHPUT",
          summary: {
            windowMs: 60_000,
            processedAt: Date.now(),
            sampleSize: 1,
            hotspotZones: [],
            zones: [
              {
                zone: "South Gate",
                eventCount: 1,
                consumedUnits: 2,
                restockedUnits: 0,
                ratePerMin: 2,
                isHotspot: false,
              },
            ],
          },
        },
      } as MessageEvent);
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.summary?.sampleSize).toBe(1);
  });

  it("marks status error when the worker reports ERROR", async () => {
    const { result } = renderHook(() =>
      useAnalyticsWorker(sample, Date.now())
    );

    await act(async () => {
      vi.advanceTimersByTime(250);
      lastWorker?.onmessage?.({
        data: { type: "ERROR", message: "boom" },
      } as MessageEvent);
    });

    expect(result.current.status).toBe("error");
  });

  it("terminates the worker on unmount", () => {
    const { unmount } = renderHook(() =>
      useAnalyticsWorker(sample, Date.now())
    );

    unmount();
    expect(lastWorker?.terminate).toHaveBeenCalled();
  });
});
