"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CommandCenterGaugePanel } from "@/components/command-center/CommandCenterGaugePanel";
import { CommandCenterKpiHero } from "@/components/command-center/CommandCenterKpiHero";
import { InteractiveMap } from "@/components/InteractiveMap";
import { IncidentSidebar } from "@/components/IncidentSidebar";
import { ZoneHealthOverview } from "@/components/ZoneHealthOverview";
import { useCommandCenterSync } from "@/features/live-radar/hooks/use-command-center-sync";
import { useLiveFeed } from "@/features/live-radar/hooks/use-live-feed";
import { deriveZoneSnapshots } from "@/features/live-radar/lib/zone-stock";
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

  const { wsUrl, simulatorOnly, wsStatus, streamRateLabel } = useLiveFeed();
  useCommandCenterSync();

  return (
    <main className="bry-shell bry-shell--page mx-auto max-w-(--content-max) p-6 sm:p-8 lg:p-12">
      <div
        className="bry-search-whisper mb-8 flex max-w-sm items-center gap-3 px-5 py-3.5 text-sm text-(--text-muted)"
        aria-hidden="true"
      >
        <Search size={18} strokeWidth={1.5} />
        <span>Search zones&hellip;</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <CommandCenterKpiHero
          eventCount={eventCount}
          criticalCount={criticalCount}
          simulatorOnly={simulatorOnly}
          wsUrl={wsUrl}
          wsStatus={wsStatus}
        />
        <CommandCenterGaugePanel
          activeZones={activeZones}
          streamRateLabel={streamRateLabel}
          criticalCount={criticalCount}
        />
      </div>

      <ZoneHealthOverview snapshots={snapshots} events={events} />

      <div className="mt-6 flex flex-col gap-5">
        <section
          id="venue-map"
          className="bry-box bry-row-enter overflow-hidden p-5 sm:p-7"
        >
          <div className="bry-section-head bry-venue-section-head mb-4">
            <div>
              <h2 className="bry-section-title">Venue map</h2>
              <p className="bry-section-subtitle">
                Zone fill follows stock tiers — click a zone or activity row to
                focus
              </p>
            </div>
          </div>
          <div className="bry-venue-map-canvas bry-inner bry-glass overflow-hidden">
            <div className="min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]">
              <InteractiveMap />
            </div>
          </div>
        </section>

        <section className="bry-zone-activity-section bry-box bry-row-enter p-5 sm:p-7">
          <div className="bry-section-head mb-4">
            <div>
              <h2 className="bry-section-title">Zone activity</h2>
              <p className="bry-section-subtitle sm:hidden">
                Tap a row to highlight the zone on the map
              </p>
              <p className="bry-section-subtitle hidden sm:block">
                Synced with the map — hover a row or click a zone
              </p>
            </div>
          </div>
          <IncidentSidebar />
        </section>
      </div>
    </main>
  );
}
