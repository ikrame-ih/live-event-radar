import type { ZoneSnapshot } from "./zone-stock";
import { zoneStatusCaption } from "./zone-stock";

/**
 * Plain-text shift snapshot for coordinators — paste into WhatsApp / Slack.
 */
export function formatShiftSummary(
  snapshots: ZoneSnapshot[],
  eventCount: number,
  at: Date = new Date()
): string {
  const time = at.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const lines = [
    `LiveEvent Radar — shift snapshot (${time})`,
    "",
    ...snapshots.map((snap) => {
      const status = zoneStatusCaption(snap);
      return `• ${snap.zone}: ${snap.stock}% (${status}) · ${snap.demand30s} evt/30s`;
    }),
    "",
    `Events stored: ${eventCount}`,
  ];
  return lines.join("\n");
}
