"use client";

import { useEffect, useRef } from "react";
import {
  mockRestockPulse,
  mockSeedHistory,
  mockStockEvent,
} from "../mock/mock-event-generator";
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
  const appendEvents = useTelemetryStore((s) => s.appendEvents);
  const seededRef = useRef(false);

  useEffect(() => {
    const useNetwork = Boolean(wsUrl) && !simulatorOnly;
    if (useNetwork) return undefined;

    // Prefill once so the first paint already shows drained zones / ETA.
    if (!seededRef.current && useTelemetryStore.getState().events.length === 0) {
      seededRef.current = true;
      appendEvents(mockSeedHistory(Date.now(), 180_000, SIMULATOR_TICK_MS));
    }

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
  }, [appendEvent, appendEvents, simulatorOnly, wsUrl]);
}
