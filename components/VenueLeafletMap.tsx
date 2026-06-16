"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { ZONE_NAMES } from "@/features/live-radar/lib/derive-incidents";
import { VENUE_CENTER, VENUE_MAP_ZOOM, ZONE_GEO } from "@/features/live-radar/lib/zone-geo";
import {
  deriveZoneSnapshots,
  stockHeat,
  zoneStatusCaption,
} from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import "leaflet/dist/leaflet.css";

function markerColor(stock: number): string {
  const heat = stockHeat(stock);
  if (heat === "hot") return "#e54d3a";
  if (heat === "mid") return "#d97706";
  return "#0d9b5c";
}

export function VenueLeafletMap() {
  const events = useTelemetryStore((s) => s.events);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setNow(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const snapshots = useMemo(() => deriveZoneSnapshots(events, now), [events, now]);
  const snapshotByZone = useMemo(
    () => new Map(snapshots.map((s) => [s.zone, s])),
    [snapshots],
  );

  if (!mounted) {
    return (
      <div
        className="flex min-h-[360px] items-center justify-center text-sm text-[var(--text-muted)]"
        data-venue-leaflet-map
      >
        Loading map…
      </div>
    );
  }

  return (
    <div
      className="venue-leaflet-map min-h-[360px] overflow-hidden rounded-[var(--radius-inner)]"
      data-venue-leaflet-map
    >
      <MapContainer
        center={[VENUE_CENTER.lat, VENUE_CENTER.lng]}
        zoom={VENUE_MAP_ZOOM}
        scrollWheelZoom={false}
        className="h-[360px] w-full sm:h-[420px]"
        aria-label="OpenStreetMap view of Teatinos, Málaga with live zone markers"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ZONE_NAMES.map((zone) => {
          const geo = ZONE_GEO[zone];
          if (!geo) return null;
          const snap = snapshotByZone.get(zone);
          const stock = snap?.stock ?? 100;
          const color = markerColor(stock);
          const radius = 14 + ((100 - stock) / 100) * 10;

          return (
            <CircleMarker
              key={zone}
              center={[geo.lat, geo.lng]}
              radius={radius}
              pathOptions={{
                color: "#f3f2f6",
                weight: 2,
                fillColor: color,
                fillOpacity: 0.85,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span className="font-semibold">{zone}</span>
                <br />
                Stock {stock}% · {snap?.demand30s ?? 0} evt/30s
              </Tooltip>
              <Popup>
                <div className="text-sm leading-relaxed">
                  <p className="font-bold">{zone}</p>
                  <p className="text-[var(--text-muted)]">Teatinos · Málaga</p>
                  <p className="mt-2">
                    Stock: <strong>{stock}%</strong>
                  </p>
                  <p>
                    Activity: {snap?.demand30s ?? 0} evt/30s
                    {snap && snap.spikes15s > 0 ? ` · ${snap.spikes15s} spikes` : ""}
                  </p>
                  {snap?.lastItem && (
                    <p className="text-[var(--text-secondary)]">
                      Last: {snap.lastItem} ({snap.lastQuantity})
                    </p>
                  )}
                  <p className="mt-1 font-semibold" style={{ color }}>
                    {snap ? zoneStatusCaption(snap) : "Healthy"}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
