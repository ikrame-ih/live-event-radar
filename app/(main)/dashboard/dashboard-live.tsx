"use client";

import { useState } from "react";
import { useAnalyticsWorker } from "@/features/live-radar/hooks/use-analytics-worker";
import { useSimulatorStream } from "@/features/live-radar/hooks/use-simulator-stream";
import { useStockWebSocket } from "@/features/live-radar/hooks/use-stock-websocket";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { MAX_EVENTS } from "@/features/live-radar/constants";
import {
  EventStreamFilters,
  type StreamFilters,
} from "./_components/event-stream-filters";
import { EventStreamList } from "./_components/event-stream-list";
import { DashboardVenueMap } from "./_components/dashboard-venue-map";
import { LiveStatusBadge } from "./_components/live-status-badge";

const defaultFilters: StreamFilters = {
  search: "",
  zone: "all",
  status: "all",
};

export function DashboardLive() {
  const events = useTelemetryStore((s) => s.events);
  const [filters, setFilters] = useState<StreamFilters>(defaultFilters);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";
  const wsConnected = Boolean(wsUrl && !simulatorOnly);

  useStockWebSocket(simulatorOnly || !wsUrl ? undefined : wsUrl);
  useSimulatorStream();
  const workerEcho = useAnalyticsWorker("live-event-radar");

  const maxLabel = Intl.NumberFormat("en-US").format(MAX_EVENTS);

  return (
    <div className="bry-shell mx-auto max-w-[var(--content-max)] p-6 sm:p-8 lg:p-12">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              LiveEvent Radar
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Brand Activation Demo &middot; live telemetry stream
            </p>
          </div>
          <LiveStatusBadge
            simulatorOnly={simulatorOnly}
            wsConnected={wsConnected}
          />
        </div>

        <EventStreamFilters filters={filters} onChange={setFilters} />

        <div className="mt-8">
          <DashboardVenueMap />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-bold">Event stream</h2>
          <div className="bry-box bry-row-enter px-5 py-3 text-right">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Buffered rows
            </p>
            <p
              className="font-mono text-2xl font-extrabold tabular-nums sm:text-3xl"
              data-kpi-buffer-count
            >
              {events.length}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              cap {maxLabel} · FIFO
            </p>
          </div>
        </div>

        <div className="mt-5">
          <EventStreamList events={events} filters={filters} />
        </div>

        {workerEcho && (
          <span className="sr-only" data-worker-echo={workerEcho}>
            {workerEcho}
          </span>
        )}
    </div>
  );
}
