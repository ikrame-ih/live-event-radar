"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, Search } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { InteractiveMap } from "@/components/InteractiveMap";
import { IncidentSidebar } from "@/components/IncidentSidebar";
import { ZoneHealthOverview } from "@/components/ZoneHealthOverview";
import { StreamGauge } from "@/components/StreamGauge";
import { useCommandCenterSync } from "@/features/live-radar/hooks/use-command-center-sync";
import { useSimulatorStream } from "@/features/live-radar/hooks/use-simulator-stream";
import { useStockWebSocket } from "@/features/live-radar/hooks/use-stock-websocket";
import { deriveZoneSnapshots } from "@/features/live-radar/lib/zone-stock";
import { alertCountLabel } from "@/features/live-radar/lib/alert-label";
import { SIMULATOR_TICK_MS } from "@/features/live-radar/constants";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { useEventStore } from "@/store/useEventStore";

export default function CommandCenter() {
  const eventCount = useTelemetryStore((s) => s.events.length);
  const events = useTelemetryStore((s) => s.events);
  const incidents = useEventStore((s) => s.incidents);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const snapshots = useMemo(
    () => deriveZoneSnapshots(events, now),
    [events, now]
  );
  const criticalCount = incidents.filter(
    (i) => i.severity === "critical"
  ).length;
  const activeZones = snapshots.filter((s) => s.demand30s > 0).length;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";
  const live = Boolean(wsUrl && !simulatorOnly);
  const streamRateLabel = live
    ? "~live"
    : `~${(1000 / SIMULATOR_TICK_MS).toFixed(1)}/s`;

  useStockWebSocket(simulatorOnly || !wsUrl ? undefined : wsUrl);
  useCommandCenterSync();
  useSimulatorStream();

  return (
    <div className="min-h-screen bry-page-shell px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <AppHeader criticalCount={criticalCount} roleLabel="Coordinator" />

      <main className="bry-shell bry-shell--page bry-shell-enter mx-auto max-w-[var(--content-max)] p-6 sm:p-8 lg:p-12">
        <div className="bry-search-whisper mb-8 flex max-w-sm items-center gap-3 px-5 py-3.5 text-sm text-[var(--text-muted)]">
          <Search size={18} strokeWidth={1.5} />
          <span>Search zones&hellip;</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
          <div className="bry-kpi-hero bry-box bry-row-enter flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div
              className="bry-kpi-hero-icon flex shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
              style={{
                background: "var(--box-inner)",
                boxShadow: "var(--shadow-inset)",
              }}
            >
              <Radio
                size={32}
                strokeWidth={1.5}
                className="text-[var(--text-muted)]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="bry-caps mb-2">Live operations</h1>
              <p
                className="bry-stat-big bry-kpi-display font-mono"
                data-kpi-buffer-count
              >
                {eventCount.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Events buffered
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="bry-inset inline-flex h-9 items-center px-4 text-xs font-bold uppercase tracking-wide">
                  {live ? "Live" : "Simulator"}
                </span>
                {criticalCount > 0 && (
                  <span className="bry-tag-neon inline-flex h-9 items-center px-4">
                    {alertCountLabel(criticalCount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bry-kpi-gauge bry-box bry-row-enter p-6 sm:p-7">
            <p className="bry-caps mb-4 text-center">30 second window</p>
            <StreamGauge value={activeZones} max={3} />
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex justify-between border-b border-white/45 pb-2">
                <span className="text-[var(--text-muted)]">Active zones</span>
                <span className="font-bold tabular-nums">{activeZones}/3</span>
              </li>
              <li className="flex justify-between border-b border-white/45 pb-2">
                <span className="text-[var(--text-muted)]">Stream rate</span>
                <span className="font-bold tabular-nums">
                  {streamRateLabel}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--text-muted)]">Critical</span>
                <span className="font-bold tabular-nums">{criticalCount}</span>
              </li>
            </ul>
          </div>
        </div>

        <ZoneHealthOverview snapshots={snapshots} events={events} />

        <div className="mt-6 flex flex-col gap-5">
          <section
            id="venue-map"
            className="bry-box bry-row-enter overflow-hidden p-5 sm:p-7"
          >
            <div className="bry-venue-section-head mb-4">
              <h2 className="text-lg font-bold">Venue map</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Spatial layout — zone fill follows stock legend; click a zone or
                Zone activity row to focus
              </p>
            </div>
            <div className="bry-venue-map-canvas bry-inner bry-glass overflow-hidden">
              <div className="min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]">
                <InteractiveMap />
              </div>
            </div>
          </section>

          <section className="bry-zone-activity-section bry-box bry-row-enter p-5 sm:p-7">
            <h2 className="mb-1 text-lg font-bold">Zone activity</h2>
            <p className="mb-4 text-xs text-[var(--text-muted)] sm:hidden">
              Tap a row to highlight the zone on the map
            </p>
            <p className="mb-4 hidden text-xs text-[var(--text-muted)] sm:block">
              Live feed synced with the venue map — hover, tap a row, or click a
              zone
            </p>
            <IncidentSidebar />
          </section>
        </div>
      </main>
    </div>
  );
}
