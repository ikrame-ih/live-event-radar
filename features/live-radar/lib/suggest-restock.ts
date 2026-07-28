import type { MinutesUntilEmpty } from "./estimate-minutes-until-empty";
import type { ZoneSnapshot } from "./zone-stock";

export type RestockSuggestion = {
  fromZone: string;
  toZone: string;
  /** Suggested abstract units to move (demo scale 0–100 stock model). */
  units: number;
  reason: string;
};

const URGENT_ETA_MIN = 20;
const DONOR_MIN_STOCK = 65;
const DONOR_MIN_ETA_OR_NULL = 45;

/**
 * One actionable redistribution hint for coordinators.
 *
 * Product intent: replace the late WhatsApp "we're out" with an earlier nudge
 * grounded in live stock + ETA — still a heuristic, not warehouse optimization.
 *
 * Returns at most one suggestion so the UI stays decisive (depth > feature pile).
 */
export function suggestRestockMove(
  snapshots: readonly ZoneSnapshot[],
  etas: readonly MinutesUntilEmpty[]
): RestockSuggestion | null {
  const etaByZone = new Map(etas.map((eta) => [eta.zone, eta]));

  const needy = [...snapshots]
    .map((snap) => {
      const eta = etaByZone.get(snap.zone);
      const minutes = eta?.minutes;
      const urgency =
        minutes === null || minutes === undefined
          ? snap.stock < 35
            ? 1000 + (35 - snap.stock)
            : Number.POSITIVE_INFINITY
          : minutes;
      return { snap, urgency, minutes };
    })
    .filter((row) => row.urgency <= URGENT_ETA_MIN || row.snap.stock < 40)
    .sort((a, b) => a.urgency - b.urgency || a.snap.stock - b.snap.stock);

  const target = needy[0];
  if (!target) return null;

  const donors = [...snapshots]
    .filter((snap) => snap.zone !== target.snap.zone)
    .filter((snap) => {
      const eta = etaByZone.get(snap.zone);
      const minutes = eta?.minutes;
      const etaOk =
        minutes === null ||
        minutes === undefined ||
        minutes >= DONOR_MIN_ETA_OR_NULL;
      return snap.stock >= DONOR_MIN_STOCK && etaOk;
    })
    .sort((a, b) => b.stock - a.stock);

  const donor = donors[0];
  if (!donor) return null;

  // Move enough to lift the needy zone toward the watch band without stripping the donor.
  const deficit = Math.max(0, 55 - target.snap.stock);
  const donorHeadroom = Math.max(0, donor.stock - DONOR_MIN_STOCK);
  const units = Math.max(5, Math.min(20, deficit, donorHeadroom));
  if (units < 5) return null;

  const etaText =
    target.minutes == null
      ? `stock at ${target.snap.stock}%`
      : `~${target.minutes} min to empty`;

  return {
    fromZone: donor.zone,
    toZone: target.snap.zone,
    units,
    reason: `${target.snap.zone} is under pressure (${etaText}); ${donor.zone} has spare stock (${donor.stock}%).`,
  };
}
