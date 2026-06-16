"use client";

import { useEffect } from "react";
import { useEventStore } from "@/store/useEventStore";
import { deriveIncidents } from "../lib/derive-incidents";
import { useTelemetryStore } from "../state/telemetry-store";

/** Mirrors telemetry events into the Command Center incident store. */
export function useCommandCenterSync() {
  const events = useTelemetryStore((s) => s.events);
  const syncIncidents = useEventStore((s) => s.syncIncidents);

  useEffect(() => {
    syncIncidents(deriveIncidents(events));
  }, [events, syncIncidents]);
}
