"use client";

import { useEffect, useRef, useState } from "react";
import type { StockEvent } from "../types";
import {
  selectWorkerSample,
  THROUGHPUT_WINDOW_MS,
  type ZoneThroughputSummary,
} from "../lib/zone-throughput";
import type { AnalyticsInMsg, AnalyticsOutMsg } from "../workers/analytics-messages";

export type AnalyticsWorkerStatus = "booting" | "ready" | "error" | "unsupported";

function initialWorkerStatus(): AnalyticsWorkerStatus {
  if (typeof Worker === "undefined") return "unsupported";
  return "booting";
}

/**
 * Offloads windowed throughput / hotspot math to a Worker.
 *
 * Kept narrow on purpose: ETA and session tally stay on the main thread
 * (cheap and tied to render). Debounce (~250ms) so synthetic bursts do not
 * flood postMessage.
 */
export function useAnalyticsWorker(
  events: readonly StockEvent[],
  now: number
): {
  summary: ZoneThroughputSummary | null;
  status: AnalyticsWorkerStatus;
} {
  const [summary, setSummary] = useState<ZoneThroughputSummary | null>(null);
  // Capability check at init avoids a sync setState("unsupported") inside the effect.
  const [status, setStatus] = useState<AnalyticsWorkerStatus>(initialWorkerStatus);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof Worker === "undefined") return undefined;

    let cancelled = false;
    try {
      const worker = new Worker(
        new URL("../workers/analytics.worker.ts", import.meta.url)
      );
      workerRef.current = worker;
      // Status flips from message/error callbacks only (no sync setState in this effect).
      worker.onmessage = (event: MessageEvent<AnalyticsOutMsg>) => {
        if (cancelled) return;
        const data = event.data;
        if (data.type === "THROUGHPUT") {
          setSummary(data.summary);
          setStatus("ready");
          return;
        }
        if (data.type === "ERROR") {
          setStatus("error");
        }
      };
      worker.onerror = () => {
        if (!cancelled) setStatus("error");
      };
    } catch {
      queueMicrotask(() => {
        if (!cancelled) setStatus("unsupported");
      });
    }

    return () => {
      cancelled = true;
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker || status === "unsupported" || status === "error") return;

    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }

    // Coalesce rapid appends — a few updates per second is enough for this panel.
    timerRef.current = window.setTimeout(() => {
      const sample = selectWorkerSample(events, now, THROUGHPUT_WINDOW_MS);
      const message: AnalyticsInMsg = {
        type: "ANALYZE_WINDOW",
        events: sample,
        now,
        windowMs: THROUGHPUT_WINDOW_MS,
      };
      worker.postMessage(message);
    }, 250);

    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [events, now, status]);

  return { summary, status };
}
