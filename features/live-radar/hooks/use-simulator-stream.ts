"use client";

import { useEffect } from "react";
import { mockRestockPulse, mockStockEvent } from "../mock/mock-event-generator";
import { REPLENISH_INTERVAL_MS } from "../lib/zone-stock";
import { SIMULATOR_TICK_MS } from "../constants";
import { useTelemetryStore } from "../state/telemetry-store";

export type SimulatorStreamConfig = {
  wsUrl?: string;
  simulatorOnly: boolean;
};

/** Mock stream + 60s restock pulse when no live socket */
export function useSimulatorStream({
  wsUrl,
  simulatorOnly,
}: SimulatorStreamConfig) {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);

  useEffect(() => {
    const useNetwork = Boolean(wsUrl) && !simulatorOnly;
    if (useNetwork) return undefined;

    const tick = window.setInterval(
      () => appendEvent(mockStockEvent()),
      SIMULATOR_TICK_MS
    );
    const restock = window.setInterval(() => {
      for (const event of mockRestockPulse()) appendEvent(event);
    }, REPLENISH_INTERVAL_MS);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(restock);
    };
  }, [appendEvent, simulatorOnly, wsUrl]);
}
