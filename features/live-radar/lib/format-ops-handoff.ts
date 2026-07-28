import type { MinutesUntilEmpty } from "./estimate-minutes-until-empty";
import { formatEtaLabel } from "./estimate-minutes-until-empty";
import type { RestockSuggestion } from "./suggest-restock";
import type { ZoneSnapshot } from "./zone-stock";
import { deriveSessionTally } from "./derive-session-tally";
import type { StockEvent } from "../types";

type HandoffOptions = {
  frozen: boolean;
  at?: Date | null;
  etas: readonly MinutesUntilEmpty[];
  suggestion: RestockSuggestion | null;
};

/**
 * Coordinator handoff text — designed to paste into WhatsApp/Slack.
 * Replaces the unused earlier `formatShiftSummary` with session + ETA context
 * so the copy action matches the product story ("info arrived too late in chat").
 */
export function formatOpsHandoff(
  events: readonly StockEvent[],
  snapshots: readonly ZoneSnapshot[],
  session: { startedAt: number; endedAt: number | null },
  options: HandoffOptions
): string {
  const at = options.at ?? new Date();
  const time = at.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tally = deriveSessionTally(events, session);
  const etaByZone = new Map(options.etas.map((eta) => [eta.zone, eta]));
  const stockByZone = new Map(snapshots.map((s) => [s.zone, s.stock]));

  const lines = [
    `LiveEvent Radar — ops handoff (${time})${options.frozen ? " [FROZEN]" : ""}`,
    "",
    "Zone stock / ETA:",
    ...snapshots.map((snap) => {
      const eta = etaByZone.get(snap.zone);
      const etaLabel = eta ? formatEtaLabel(eta) : "n/a";
      return `• ${snap.zone}: ${snap.stock}% · ${etaLabel}`;
    }),
    "",
    "Session tally (out / in / net):",
    ...tally.zones.map((row) => {
      const stock = stockByZone.get(row.zone);
      const stockBit = stock == null ? "" : ` · stock ${stock}%`;
      return `• ${row.zone}: ${row.consumed} / ${row.restocked} / ${formatNet(row.net)}${stockBit}`;
    }),
    "",
    `Totals: out ${tally.totals.consumed} · in ${tally.totals.restocked} · net ${formatNet(tally.totals.net)}`,
  ];

  if (options.suggestion) {
    lines.push(
      "",
      "Suggested move:",
      `→ Transfer ~${options.suggestion.units} units: ${options.suggestion.fromZone} → ${options.suggestion.toZone}`,
      `  ${options.suggestion.reason}`
    );
  }

  lines.push("", "Heuristic ETAs assume the last 60s pace continues.");
  return lines.join("\n");
}

export function formatSessionTallyCsv(
  events: readonly StockEvent[],
  snapshots: readonly ZoneSnapshot[],
  session: { startedAt: number; endedAt: number | null },
  etas: readonly MinutesUntilEmpty[]
): string {
  const tally = deriveSessionTally(events, session);
  const etaByZone = new Map(etas.map((eta) => [eta.zone, eta]));
  const stockByZone = new Map(snapshots.map((s) => [s.zone, s.stock]));
  const header = "zone,taken_out,put_back,net,stock_pct,eta_minutes,eta_label";
  const rows = tally.zones.map((row) => {
    const eta = etaByZone.get(row.zone);
    const stock = stockByZone.get(row.zone) ?? "";
    const minutes = eta?.minutes;
    const etaMinutes = minutes === null || minutes === undefined ? "" : String(minutes);
    const etaLabel = eta ? formatEtaLabel(eta) : "";
    return [
      csv(row.zone),
      row.consumed,
      row.restocked,
      row.net,
      stock,
      etaMinutes,
      csv(etaLabel),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

function formatNet(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function csv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
