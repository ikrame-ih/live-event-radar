"use client";

import { Radio, Search } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { InteractiveMap } from "@/components/InteractiveMap";
import { IncidentSidebar } from "@/components/IncidentSidebar";
import { ZoneActionCards } from "@/components/ZoneActionCards";
import { StreamGauge } from "@/components/StreamGauge";
import { useCommandCenterSync } from "@/features/live-radar/hooks/use-command-center-sync";
import { useSimulatorStream } from "@/features/live-radar/hooks/use-simulator-stream";
import { useStockWebSocket } from "@/features/live-radar/hooks/use-stock-websocket";
import { deriveZoneSnapshots } from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { useEventStore } from "@/store/useEventStore";

export default function CommandCenter() {
  const eventCount = useTelemetryStore((s) => s.events.length);
  const events = useTelemetryStore((s) => s.events);
  const incidents = useEventStore((s) => s.incidents);
  const selectedIncidentId = useEventStore((s) => s.selectedIncidentId);
  const selectIncident = useEventStore((s) => s.selectIncident);

  const snapshots = deriveZoneSnapshots(events);
  const criticalCount = incidents.filter((i) => i.severity === "critical").length;
  const activeZones = snapshots.filter((s) => s.demand30s > 0).length;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";
  const live = Boolean(wsUrl && !simulatorOnly);

  useStockWebSocket(simulatorOnly || !wsUrl ? undefined : wsUrl);
  useCommandCenterSync();
  useSimulatorStream();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <AppHeader criticalCount={criticalCount} roleLabel="Coordinator" />

      <main className="bry-shell mx-auto max-w-[var(--content-max)] p-5 sm:p-8 lg:p-10">
        <div className="bry-inset mb-8 flex max-w-sm items-center gap-3 px-5 py-3.5 text-sm text-[var(--text-muted)]">
          <Search size={18} strokeWidth={1.5} />
          <span>Search zones&hellip;</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
          <div className="bry-box flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
              style={{ background: "var(--box-inner)", boxShadow: "var(--shadow-inset)" }}
            >
              <Radio size={32} strokeWidth={1.5} className="text-[var(--text-muted)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="bry-caps mb-2">Live operations</h1>
              <p className="bry-stat-big font-mono" data-kpi-buffer-count>
                {eventCount.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Events buffered</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bry-inset inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                  {live ? "Live" : "Simulator"}
                </span>
                {criticalCount > 0 && <span className="bry-tag-neon">{criticalCount} alert</span>}
              </div>
            </div>
          </div>

          <div className="bry-box p-6 sm:p-7">
            <p className="bry-caps mb-4 text-center">30 second window</p>
            <StreamGauge value={activeZones} max={3} />
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex justify-between border-b border-[var(--box-inset)] pb-2">
                <span className="text-[var(--text-muted)]">Active zones</span>
                <span className="font-bold tabular-nums">{activeZones}/3</span>
              </li>
              <li className="flex justify-between border-b border-[var(--box-inset)] pb-2">
                <span className="text-[var(--text-muted)]">Stream rate</span>
                <span className="font-bold tabular-nums">~1/s</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--text-muted)]">Critical</span>
                <span className="font-bold tabular-nums">{criticalCount}</span>
              </li>
            </ul>
          </div>
        </div>

        {incidents.length > 0 && (
          <div className="mt-6">
            <ZoneActionCards selectedId={selectedIncidentId} onSelect={selectIncident} />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-5">
          <section id="venue-map" className="bry-box overflow-hidden p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Venue map</h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Stock by zone · auto-restock every 45s
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
              <div className="min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]">
                <InteractiveMap />
              </div>
            </div>
          </section>

          <section className="bry-box p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Zone activity</h2>
            <IncidentSidebar />
          </section>
        </div>
      </main>
    </div>
  );
}
