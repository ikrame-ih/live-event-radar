"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { deriveZoneSnapshots } from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const VenueLeafletMap = dynamic(
  () => import("@/components/VenueLeafletMap").then((m) => m.VenueLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-[var(--text-muted)]">
        Loading map…
      </div>
    ),
  },
);

export function DashboardVenueMap() {
  const events = useTelemetryStore((s) => s.events);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const snapshots = useMemo(() => deriveZoneSnapshots(events, now), [events, now]);

  return (
    <section id="venue-map" className="bry-box overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Venue map</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Teatinos, Málaga · OpenStreetMap · live stock markers
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshots.map((snap) => (
            <span
              key={snap.zone}
              className={`pill-zone ${
                snap.status === "critical"
                  ? "pill-amber"
                  : snap.status === "watch"
                    ? ""
                    : "pill-green"
              }`}
            >
              {snap.zone.split(" ")[0]} {snap.stock}%
            </span>
          ))}
        </div>
      </div>
      <div className="bry-inner overflow-hidden">
        <VenueLeafletMap />
      </div>
    </section>
  );
}
