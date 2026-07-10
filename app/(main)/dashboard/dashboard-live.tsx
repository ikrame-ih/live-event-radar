"use client";

import { useState } from "react";
import { ConnectionStatusBadge } from "@/components/ConnectionStatusBadge";
import { useAnalyticsWorker } from "@/features/live-radar/hooks/use-analytics-worker";
import { useLiveFeed } from "@/features/live-radar/hooks/use-live-feed";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { MAX_EVENTS } from "@/features/live-radar/constants";
import {
  EventStreamFilters,
  type StreamFilters,
} from "./_components/event-stream-filters";
import { EventStreamList } from "./_components/event-stream-list";
import { DashboardVenueMap } from "./_components/dashboard-venue-map";

const defaultFilters: StreamFilters = {
  search: "",
  zone: "all",
  status: "all",
};

export function DashboardLive() {
  const events = useTelemetryStore((s) => s.events);
  const [filters, setFilters] = useState<StreamFilters>(defaultFilters);

  const { wsUrl, simulatorOnly, wsStatus } = useLiveFeed();
  const workerEcho = useAnalyticsWorker("live-event-radar");

  const maxLabel = Intl.NumberFormat("en-US").format(MAX_EVENTS);

  return (
    <main className="bry-shell mx-auto max-w-(--content-max) p-6 sm:p-8 lg:p-12">
      <div className="bry-section-head mb-6">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            LiveEvent Radar
          </h1>
          <p className="bry-section-subtitle text-sm">
            Brand activation demo · live stream
          </p>
        </div>
        <ConnectionStatusBadge
          simulatorOnly={simulatorOnly}
          wsUrl={wsUrl}
          wsStatus={wsStatus}
        />
      </div>

      <EventStreamFilters filters={filters} onChange={setFilters} />

      <div className="mt-8">
        <DashboardVenueMap />
      </div>

      <div className="bry-section-head mt-8">
        <div>
          <h2 className="bry-section-title">Event stream</h2>
          <p className="bry-section-subtitle">
            Latest stock events, filtered without reloading the dashboard
          </p>
        </div>
        <div className="bry-box bry-mini-metric bry-row-enter">
          <p className="text-xs font-medium text-(--text-muted)">
            Buffered rows
          </p>
          <p
            className="font-mono text-2xl font-extrabold tabular-nums sm:text-3xl"
            data-kpi-buffer-count
          >
            {events.length}
          </p>
          <p className="text-xs text-(--text-muted)">
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
    </main>
  );
}
