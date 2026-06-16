"use client";

import { useEffect } from "react";
import {
  mockRestockPulse,
  mockStockEvent,
} from "../mock/mock-event-generator";
import { REPLENISH_INTERVAL_MS } from "../lib/zone-stock";
import { useTelemetryStore } from "../state/telemetry-store";

/** Mock ~1 evt/s plus periodic restock pulse when WebSocket is off. */
export function useSimulatorStream() {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";

  useEffect(() => {
    const useNetwork = wsUrl && !simulatorOnly;
    if (useNetwork) return;

    const tick = window.setInterval(() => appendEvent(mockStockEvent()), 1000);
    const restock = window.setInterval(() => {
      for (const event of mockRestockPulse()) appendEvent(event);
    }, REPLENISH_INTERVAL_MS);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(restock);
    };
  }, [appendEvent, simulatorOnly, wsUrl]);
}
