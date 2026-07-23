import type { SessionTally } from "./derive-session-tally";
import { ZONE_META } from "./zone-stock";

/**
 * WhatsApp / Slack paste — session out/in/net per zone + live stock %.
 */
export function formatSessionTallyShare(
  tally: SessionTally,
  stockByZone: Map<string, number>,
  options?: { frozen?: boolean; at?: Date }
): string {
  const at = options?.at ?? new Date();
  const time = at.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const status = options?.frozen ? "ENDED" : "LIVE";
  const lines = [
    `LiveEvent Radar — session tally (${status} · ${time})`,
    `Total: ${tally.totals.consumed} out · ${tally.totals.restocked} in · net ${formatNet(tally.totals.net)}`,
    "",
    ...tally.zones.map((row) => {
      const short = ZONE_META[row.zone]?.short ?? row.zone;
      const stock = stockByZone.get(row.zone);
      const share =
        tally.totals.consumed > 0
          ? Math.round((row.consumed / tally.totals.consumed) * 100)
          : 0;
      const stockBit = stock != null ? ` · now ${stock}%` : "";
      return `• ${short}: −${row.consumed} / +${row.restocked} / net ${formatNet(row.net)} (${share}% of out)${stockBit}`;
    }),
  ];
  return lines.join("\n");
}

function formatNet(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
