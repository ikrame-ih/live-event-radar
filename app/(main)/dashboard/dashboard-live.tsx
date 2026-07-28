"use client";

import { useEffect, useState } from "react";
import { AnimatedBufferCount } from "@/components/AnimatedBufferCount";
import { ConnectionStatusBadge } from "@/components/ConnectionStatusBadge";
import { WorkerThroughputPanel } from "@/components/WorkerThroughputPanel";
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
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { wsUrl, simulatorOnly, wsStatus } = useLiveFeed();
  const { summary, status: workerStatus } = useAnalyticsWorker(events, now);

  const maxLabel = Intl.NumberFormat("en-US").format(MAX_EVENTS);

  return (
    <main className="bry-shell mx-auto max-w-(--content-max) p-6 sm:p-8 lg:p-12">
      <div className="bry-section-head mb-5">
        <div>
          <h1 className="bry-section-title text-2xl sm:text-[1.75rem]">
            Live dashboard
          </h1>
          <p className="bry-section-subtitle">
            Map and stock events, updated as they happen
          </p>
        </div>
        <ConnectionStatusBadge
          simulatorOnly={simulatorOnly}
          wsUrl={wsUrl}
          wsStatus={wsStatus}
        />
      </div>

      <div className="bry-dashboard-split">
        <DashboardVenueMap focusedZone={focusedZone} />

        <section className="bry-stream-panel bry-box p-4 sm:p-5">
          <div className="bry-section-head">
            <div>
              <h2 className="bry-section-title">Stock events</h2>
              <p className="bry-section-subtitle">
                Tap a row to highlight that zone on the map
              </p>
            </div>
            <div className="bry-stream-buffer shrink-0 text-right">
              <p className="bry-caps text-[11px]">Stored</p>
              <AnimatedBufferCount
                value={events.length}
                className="bry-metric text-xl font-extrabold sm:text-2xl"
              />
              <p className="text-[11px] text-(--text-muted)">
                cap {maxLabel}
              </p>
            </div>
          </div>

          <EventStreamFilters filters={filters} onChange={setFilters} />

          <EventStreamList
            events={events}
            filters={filters}
            onFocusZone={setFocusedZone}
          />
        </section>
      </div>

      <WorkerThroughputPanel summary={summary} status={workerStatus} />
    </main>
  );
}
