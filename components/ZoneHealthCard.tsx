import {
  zoneStatusCaption,
  type ZoneSnapshot,
  type ZoneStatus,
} from "@/features/live-radar/lib/zone-stock";

function statusPillClass(status: ZoneStatus): string {
  switch (status) {
    case "critical":
      return "pill-zone pill-coral";
    case "watch":
      return "pill-zone pill-amber";
    case "healthy":
      return "pill-zone pill-green";
    default:
      return "pill-zone pill-green";
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
    default:
      return "bry-stock-fill-healthy";
  }
}

function formatLastEvent(snapshot: ZoneSnapshot): string {
  if (!snapshot.lastItem) return "—";
  if (snapshot.lastQuantity == null) return snapshot.lastItem;
  const sign = snapshot.lastQuantity > 0 ? "+" : "";
  return `${snapshot.lastItem} (${sign}${snapshot.lastQuantity})`;
}

type ZoneHealthCardProps = {
  snapshot: ZoneSnapshot;
};

export function ZoneHealthCard({ snapshot }: ZoneHealthCardProps) {
  return (
    <article className="bry-zone-health-card bry-box bry-row-enter flex flex-col justify-between gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="bry-card-title truncate">
            {snapshot.zone}
          </p>
          <p className="truncate text-xs text-(--text-muted)">
            {snapshot.subtitle}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusPillClass(snapshot.status)}`}
        >
          {zoneStatusCaption(snapshot)}
        </span>
      </div>

      <div className="mt-auto">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-xs text-(--text-muted)">Stock</span>
          <span className="bry-metric text-sm">
            {snapshot.stock}%
          </span>
        </div>
        <div className="bry-stock-bar" aria-hidden>
          <div
            className={`bry-stock-fill ${stockBarClass(snapshot.status)}`}
            style={{ width: `${snapshot.stock}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5 border-t border-white/45 pt-3 text-xs">
        <li className="bry-zone-stat-row">
          <span className="text-(--text-muted)">Demand</span>
          <span className="bry-metric bry-zone-stat-value">
            {snapshot.demand30s} evt/30s
          </span>
        </li>
        <li className="bry-zone-stat-row">
          <span className="text-(--text-muted)">Spikes (15s)</span>
          <span className="bry-metric bry-zone-stat-value">
            {snapshot.spikes15s}
          </span>
        </li>
        <li className="bry-zone-stat-row">
          <span className="text-(--text-muted)">Last event</span>
          <span className="bry-zone-stat-value truncate font-medium text-(--text-secondary)">
            {formatLastEvent(snapshot)}
          </span>
        </li>
      </ul>
    </article>
  );
}
