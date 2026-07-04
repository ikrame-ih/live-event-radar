"use client";

import { useEffect, useState } from "react";
import type { StockEvent } from "@/features/live-radar/types";
import {
  formatRestockCountdown,
  msUntilNextRestock,
} from "@/features/live-radar/lib/restock-countdown";
import { ZONE_META, type ZoneSnapshot } from "@/features/live-radar/lib/zone-stock";
import { ZoneHealthCard } from "@/components/ZoneHealthCard";

type Props = {
  snapshots: ZoneSnapshot[];
  events: StockEvent[];
};

export function ZoneHealthOverview({ snapshots, events }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const restockMs = msUntilNextRestock(events, now);
  const avgStock =
    snapshots.length > 0
      ? Math.round(
          snapshots.reduce((sum, snapshot) => sum + snapshot.stock, 0) /
            snapshots.length
        )
      : 0;
  const atRisk = snapshots.filter(
    (snapshot) => snapshot.status !== "healthy"
  ).length;
  const lowest = [...snapshots].sort(
    (left, right) => left.stock - right.stock
  )[0];

  return (
    <section className="mt-6" aria-label="Zone inventory">
      <div className="bry-section-head mb-4">
        <div>
          <h2 className="bry-section-title">Zone inventory</h2>
          <p className="bry-section-subtitle">
            Stock and demand by zone
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="pill-zone font-semibold tabular-nums">
            Restock in {formatRestockCountdown(restockMs)}
          </span>
          <span className="pill-zone font-semibold tabular-nums">
            Avg {avgStock}%
          </span>
          {atRisk > 0 && (
            <span className="pill-zone pill-amber font-semibold tabular-nums">
              {atRisk} at risk
            </span>
          )}
          {lowest && (
            <span className="pill-zone font-semibold tabular-nums">
              Low: {ZONE_META[lowest.zone]?.short ?? lowest.zone.split(" ")[0]}{" "}
              {lowest.stock}%
            </span>
          )}
        </div>
      </div>

      <div className="bry-zone-health-grid grid gap-4 sm:grid-cols-3">
        {snapshots.map((snapshot) => (
          <ZoneHealthCard key={snapshot.zone} snapshot={snapshot} />
        ))}
      </div>
    </section>
  );
}
