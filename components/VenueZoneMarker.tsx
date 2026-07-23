import { CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { ZoneSnapshot } from "@/features/live-radar/lib/zone-stock";
import { zoneStatusCaption } from "@/features/live-radar/lib/zone-stock";

type VenueZoneMarkerProps = {
  zone: string;
  lat: number;
  lng: number;
  stock: number;
  color: string;
  radius: number;
  snapshot: ZoneSnapshot | undefined;
  selected?: boolean;
  dimmed?: boolean;
};

export function VenueZoneMarker({
  zone,
  lat,
  lng,
  stock,
  color,
  radius,
  snapshot,
  selected = false,
  dimmed = false,
}: VenueZoneMarkerProps) {
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={radius}
      pathOptions={{
        color: selected ? "#e54d3a" : "#f3f2f6",
        weight: selected ? 3 : 2,
        fillColor: color,
        fillOpacity: dimmed ? 0.35 : selected ? 0.95 : 0.85,
      }}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
        <span className="font-semibold">{zone}</span>
        <br />
        Stock {stock}% · {snapshot?.demand30s ?? 0} evt/30s
      </Tooltip>
      <Popup>
        <VenueZonePopup
          zone={zone}
          stock={stock}
          color={color}
          snapshot={snapshot}
        />
      </Popup>
    </CircleMarker>
  );
}

function VenueZonePopup({
  zone,
  stock,
  color,
  snapshot,
}: {
  zone: string;
  stock: number;
  color: string;
  snapshot: ZoneSnapshot | undefined;
}) {
  return (
    <div className="text-sm leading-relaxed">
      <p className="font-bold">{zone}</p>
      <p className="text-[var(--text-muted)]">Live venue</p>
      <p className="mt-2">
        Stock: <strong>{stock}%</strong>
      </p>
      <p>
        Activity: {snapshot?.demand30s ?? 0} evt/30s
        {snapshot && snapshot.spikes15s > 0
          ? ` · ${snapshot.spikes15s} spikes`
          : ""}
      </p>
      {snapshot?.lastItem && (
        <p className="text-[var(--text-secondary)]">
          Last: {snapshot.lastItem} ({snapshot.lastQuantity})
        </p>
      )}
      <p className="mt-1 font-semibold" style={{ color }}>
        {snapshot ? zoneStatusCaption(snapshot) : "Healthy"}
      </p>
    </div>
  );
}
