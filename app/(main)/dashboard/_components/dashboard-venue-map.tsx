"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { deriveZoneSnapshots } from "@/features/live-radar/lib/zone-stock";
import { useNow } from "@/features/live-radar/hooks/use-now";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const VenueLeafletMap = dynamic(
  () => import("@/components/VenueLeafletMap").then((m) => m.VenueLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading map…
      </div>
    ),
  }
);

type DashboardVenueMapProps = {
  focusedZone?: string | null;
};

export function DashboardVenueMap({
  focusedZone = null,
}: DashboardVenueMapProps) {
  const events = useTelemetryStore((s) => s.events);
  const now = useNow();

  const snapshots = useMemo(
    () => (now ? deriveZoneSnapshots(events, now) : []),
    [events, now]
  );

  return (
    <section
      id="venue-map"
      className="bry-dashboard-map bry-box overflow-hidden p-4 sm:p-5"
    >
      <div className="bry-section-head mb-3 shrink-0">
        <div>
          <h2 className="bry-section-title">Venue map</h2>
          <p className="bry-section-subtitle">
            Markers update as stock moves
            {focusedZone ? ` · focused: ${focusedZone}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {snapshots.map((snap) => (
            <span
              key={snap.zone}
              className={`pill-zone !px-2.5 !py-1 text-[11px] ${
                snap.zone === focusedZone
                  ? "pill-coral"
                  : snap.status === "critical"
                    ? "pill-coral"
                    : snap.status === "watch"
                      ? "pill-amber"
                      : "pill-green"
              }`}
            >
              {snap.zone.split(" ")[0]} {snap.stock}%
            </span>
          ))}
        </div>
      </div>
      <div className="bry-dashboard-map-body bry-inner overflow-hidden">
        <VenueLeafletMap focusedZone={focusedZone} fill />
      </div>
    </section>
  );
}
