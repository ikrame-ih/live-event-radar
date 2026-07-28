"use client";

import { useEffect, useMemo, useState } from "react";
import type { StockEvent } from "@/features/live-radar/types";
import { estimateMinutesUntilEmpty } from "@/features/live-radar/lib/estimate-minutes-until-empty";
import {
  formatRestockCountdown,
  msUntilNextRestock,
} from "@/features/live-radar/lib/restock-countdown";
import { suggestRestockMove } from "@/features/live-radar/lib/suggest-restock";
import { ZONE_META, type ZoneSnapshot } from "@/features/live-radar/lib/zone-stock";
import { ZoneHealthCard } from "@/components/ZoneHealthCard";
import { OpsSuggestionBanner } from "@/components/OpsSuggestionBanner";

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

  const etas = useMemo(
    () =>
      snapshots.map((snap) =>
        estimateMinutesUntilEmpty(snap.zone, snap.stock, events, now)
      ),
    [snapshots, events, now]
  );

  const suggestion = useMemo(
    () => suggestRestockMove(snapshots, etas),
    [snapshots, etas]
  );

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
  const etaByZone = useMemo(
    () => new Map(etas.map((eta) => [eta.zone, eta])),
    [etas]
  );

  return (
    <section className="mt-6" aria-label="Zone stock">
      <div className="bry-section-head mb-4">
        <div>
          <h2 className="bry-section-title">Zone stock</h2>
          <p className="bry-section-subtitle">
            See which stands are running low — and how soon
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
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

      {suggestion ? <OpsSuggestionBanner suggestion={suggestion} /> : null}

      <div className="bry-zone-health-grid grid gap-4 sm:grid-cols-3">
        {snapshots.map((snapshot) => {
          const eta =
            etaByZone.get(snapshot.zone) ??
            estimateMinutesUntilEmpty(
              snapshot.zone,
              snapshot.stock,
              events,
              now
            );
          return (
            <ZoneHealthCard
              key={snapshot.zone}
              snapshot={snapshot}
              eta={eta}
            />
          );
        })}
      </div>
    </section>
  );
}
