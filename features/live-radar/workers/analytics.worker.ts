/// <reference lib="webworker" />

import { computeZoneThroughput } from "../lib/zone-throughput";
import type { AnalyticsInMsg, AnalyticsOutMsg } from "./analytics-messages";

/**
 * Analytics worker — windowed throughput only (not an echo stub).
 *
 * Receives a short sample of recent events, not the whole buffer.
 * Uses the same `computeZoneThroughput` covered by unit tests.
 */
const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = (event: MessageEvent<AnalyticsInMsg>) => {
  const msg = event.data;
  if (!msg || msg.type !== "ANALYZE_WINDOW") {
    post({ type: "ERROR", message: "unknown message" });
    return;
  }

  try {
    const summary = computeZoneThroughput(msg.events, msg.now, msg.windowMs);
    post({ type: "THROUGHPUT", summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "analytics failed";
    post({ type: "ERROR", message });
  }
};

function post(message: AnalyticsOutMsg): void {
  // skipcq: JS-S1014 — DedicatedWorkerGlobalScope.postMessage has no targetOrigin.
  scope.postMessage(message);
}
