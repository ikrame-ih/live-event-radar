import type { Incident, IncidentSeverity } from "@/store/useEventStore";
import type { StockEvent } from "../types";

export const ZONE_NAMES = [
  "South Gate",
  "Sampling Court",
  "Main Stage Walkway",
] as const;

export type ZoneName = (typeof ZONE_NAMES)[number];

/** Incident anchor — bottom-right of each zone polygon */
export const ZONE_ANCHORS: Record<ZoneName, { x: number; y: number }> = {
  "South Gate": { x: 210, y: 500 },
  "Sampling Court": { x: 600, y: 448 },
  "Main Stage Walkway": { x: 860, y: 448 },
};

const WINDOW_MS = 30_000;
const SPIKE_MS = 15_000;

function resolveSeverity(
  eventCount: number,
  spikeCount: number
): IncidentSeverity {
  if (spikeCount >= 2 || eventCount >= 10) return "critical";
  if (spikeCount >= 1 || eventCount >= 4) return "warning";
  return "resolved";
}

// One card per active zone — spikes fold into the summary so map nodes don't stack.
export function deriveIncidents(events: StockEvent[]): Incident[] {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const spikeCutoff = now - SPIKE_MS;
  const recent = events.filter((event) => event.timestamp >= cutoff);

  const rollups: Incident[] = [];

  for (const zone of ZONE_NAMES) {
    const zoneEvents = recent.filter((event) => event.zone === zone);
    if (zoneEvents.length === 0) continue;

    const spikes = zoneEvents.filter(
      (event) => event.timestamp >= spikeCutoff && event.quantity <= -2
    );
    const latest = zoneEvents[zoneEvents.length - 1];
    if (!latest) continue;
    const anchor = ZONE_ANCHORS[zone];
    if (!anchor) continue;

    rollups.push({
      id: `zone-${zone}`,
      title: spikes.length > 0 ? "High consumption" : "Stock update",
      zone,
      severity: resolveSeverity(zoneEvents.length, spikes.length),
      timestamp: latest.timestamp,
      x: anchor.x,
      y: anchor.y,
      description:
        spikes.length > 0
          ? `${spikes.length} spike(s) in 15s · ${zoneEvents.length} evt/30s · latest ${latest.item}`
          : `${zoneEvents.length} events in 30s · latest: ${latest.item} (${latest.quantity})`,
      metric: `${zoneEvents.length} evt/30s`,
    });
  }

  const severityRank: Record<IncidentSeverity, number> = {
    critical: 0,
    warning: 1,
    resolved: 2,
  };

  return rollups.sort((a, b) => {
    const bySeverity = severityRank[a.severity] - severityRank[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return b.timestamp - a.timestamp;
  });
}

export function countByZone(
  events: StockEvent[],
  windowMs = WINDOW_MS
): Map<string, number> {
  const cutoff = Date.now() - windowMs;
  const counts = new Map<string, number>();
  for (const zone of ZONE_NAMES) counts.set(zone, 0);
  for (const event of events) {
    if (event.timestamp < cutoff) continue;
    if (counts.has(event.zone))
      counts.set(event.zone, (counts.get(event.zone) ?? 0) + 1);
  }
  return counts;
}
