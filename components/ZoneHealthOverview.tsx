"use client";

import { useEffect, useState } from "react";
import type { StockEvent } from "@/features/live-radar/types";
import {
  formatRestockCountdown,
  msUntilNextRestock,
} from "@/features/live-radar/lib/restock-countdown";
import {
  ZONE_META,
  zoneStatusCaption,
  type ZoneSnapshot,
  type ZoneStatus,
} from "@/features/live-radar/lib/zone-stock";

type Props = {
  snapshots: ZoneSnapshot[];
  events: StockEvent[];
};

function statusPillClass(status: ZoneStatus): string {
  switch (status) {
    case "critical":
      return "pill-zone pill-map-low";
    case "watch":
      return "pill-zone pill-map-mid";
    case "healthy":
      return "pill-zone pill-map-cool";
  }
}

function stockBarClass(status: ZoneStatus): string {
  switch (status) {
    case "critical":
      return "bry-stock-fill-critical";
    case "watch":
      return "bry-stock-fill-watch";
    case "healthy":
      return "bry-stock-fill-healthy";
  }
}

export function ZoneHealthOverview({ snapshots, events }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const restockMs = msUntilNextRestock(events, now);
  const avgStock =
    snapshots.length > 0
      ? Math.round(snapshots.reduce((sum, s) => sum + s.stock, 0) / snapshots.length)
      : 0;
  const atRisk = snapshots.filter((s) => s.status !== "healthy").length;
  const lowest = [...snapshots].sort((a, b) => a.stock - b.stock)[0];

  return (
    <section className="mt-6" aria-label="Zone inventory">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Zone inventory</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Operational metrics — stock, demand and restock countdown by zone
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="pill-zone font-semibold tabular-nums">
            Restock in {formatRestockCountdown(restockMs)}
          </span>
          <span className="pill-zone font-semibold tabular-nums">Avg {avgStock}%</span>
          {atRisk > 0 && (
            <span className="pill-zone pill-amber font-semibold tabular-nums">
              {atRisk} at risk
            </span>
          )}
          {lowest && (
            <span className="pill-zone font-semibold tabular-nums">
              Low: {ZONE_META[lowest.zone]?.short ?? lowest.zone.split(" ")[0]} {lowest.stock}%
            </span>
          )}
        </div>
      </div>

      <div className="bry-zone-health-grid grid gap-4 sm:grid-cols-3">
        {snapshots.map((snap) => (
          <article
            key={snap.zone}
            className="bry-zone-health-card bry-box bry-row-enter flex flex-col gap-3 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{snap.zone}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{snap.subtitle}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusPillClass(snap.status)}`}
              >
                {zoneStatusCaption(snap)}
              </span>
            </div>

            <div>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-xs text-[var(--text-muted)]">Stock</span>
                <span className="font-mono text-sm font-bold tabular-nums">{snap.stock}%</span>
              </div>
              <div className="bry-stock-bar" aria-hidden>
                <div
                  className={`bry-stock-fill ${stockBarClass(snap.status)}`}
                  style={{ width: `${snap.stock}%` }}
                />
              </div>
            </div>

            <ul className="space-y-1.5 border-t border-white/45 pt-3 text-xs">
              <li className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Demand</span>
                <span className="font-mono font-semibold tabular-nums">{snap.demand30s} evt/30s</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Spikes (15s)</span>
                <span className="font-mono font-semibold tabular-nums">{snap.spikes15s}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Last event</span>
                <span className="truncate text-right font-medium text-[var(--text-secondary)]">
                  {snap.lastItem
                    ? `${snap.lastItem}${snap.lastQuantity != null ? ` (${snap.lastQuantity > 0 ? "+" : ""}${snap.lastQuantity})` : ""}`
                    : "—"}
                </span>
              </li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
