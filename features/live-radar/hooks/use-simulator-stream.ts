"use client";

import { useEffect } from "react";
import {
  mockRestockPulse,
  mockStockEvent,
} from "../mock/mock-event-generator";
import { REPLENISH_INTERVAL_MS } from "../lib/zone-stock";
import { SIMULATOR_TICK_MS } from "../constants";
import { useTelemetryStore } from "../state/telemetry-store";

/** Mock stream + 60s restock pulse when no live socket */
export function useSimulatorStream() {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";

  useEffect(() => {
    const useNetwork = wsUrl && !simulatorOnly;
    if (useNetwork) return;

    const tick = window.setInterval(() => appendEvent(mockStockEvent()), SIMULATOR_TICK_MS);
    const restock = window.setInterval(() => {
      for (const event of mockRestockPulse()) appendEvent(event);
    }, REPLENISH_INTERVAL_MS);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(restock);
    };
  }, [appendEvent, simulatorOnly, wsUrl]);
}
