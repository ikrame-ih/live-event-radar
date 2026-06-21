import type { Incident, IncidentSeverity } from "@/store/useEventStore";
import type { StockEvent } from "../types";

export const ZONE_NAMES = [
  "South Gate",
  "Sampling Court",
  "Main Stage Walkway",
] as const;

/** Incident anchor — bottom-right of each zone polygon */
export const ZONE_ANCHORS: Record<string, { x: number; y: number }> = {
  "South Gate": { x: 210, y: 500 },
  "Sampling Court": { x: 600, y: 448 },
  "Main Stage Walkway": { x: 860, y: 448 },
};

export const ZONE_SHORT: Record<string, string> = {
  "South Gate": "SG",
  "Sampling Court": "SC",
  "Main Stage Walkway": "MSW",
};

const WINDOW_MS = 30_000;
const SPIKE_MS = 15_000;

function resolveSeverity(eventCount: number, spikeCount: number): IncidentSeverity {
  if (spikeCount >= 2 || eventCount >= 10) return "critical";
  if (spikeCount >= 1 || eventCount >= 4) return "warning";
  return "resolved";
}

// One card per active zone — spikes fold into the summary so map nodes don't stack.
export function deriveIncidents(events: StockEvent[]): Incident[] {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const spikeCutoff = now - SPIKE_MS;
  const recent = events.filter((e) => e.timestamp >= cutoff);

  const rollups: Incident[] = [];

  for (const zone of ZONE_NAMES) {
    const zoneEvents = recent.filter((e) => e.zone === zone);
    if (zoneEvents.length === 0) continue;

    const spikes = zoneEvents.filter(
      (e) => e.timestamp >= spikeCutoff && e.quantity <= -2,
    );
    const latest = zoneEvents[zoneEvents.length - 1]!;
    const anchor = ZONE_ANCHORS[zone]!;

    rollups.push({
      id: `zone-${zone}`,
      title: spikes.length > 0 ? "High consumption" : "Zone activity",
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

  return rollups.sort((a, b) => b.timestamp - a.timestamp);
}

export function countByZone(
  events: StockEvent[],
  windowMs = WINDOW_MS,
): Map<string, number> {
  const cutoff = Date.now() - windowMs;
  const counts = new Map<string, number>();
  for (const zone of ZONE_NAMES) counts.set(zone, 0);
  for (const e of events) {
    if (e.timestamp < cutoff) continue;
    if (counts.has(e.zone)) counts.set(e.zone, (counts.get(e.zone) ?? 0) + 1);
  }
  return counts;
}
