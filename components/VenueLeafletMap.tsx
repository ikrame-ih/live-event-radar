"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ZONE_NAMES } from "@/features/live-radar/lib/derive-incidents";
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  VENUE_CENTER,
  VENUE_MAP_ZOOM,
  ZONE_GEO,
} from "@/features/live-radar/lib/zone-geo";
import { deriveZoneSnapshots, stockHeat } from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { VenueZoneMarker } from "@/components/VenueZoneMarker";
import "leaflet/dist/leaflet.css";

function markerColor(stock: number): string {
  const heat = stockHeat(stock);
  if (heat === "hot") return "#e54d3a";
  if (heat === "mid") return "#d97706";
  return "#0d9b5c";
}

export function VenueLeafletMap() {
  const events = useTelemetryStore((state) => state.events);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const snapshots = useMemo(
    () => deriveZoneSnapshots(events, now),
    [events, now]
  );
  const snapshotByZone = useMemo(
    () => new Map(snapshots.map((snapshot) => [snapshot.zone, snapshot])),
    [snapshots]
  );

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
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

        {ZONE_NAMES.map((zone) => {
          const geo = ZONE_GEO[zone];
          if (!geo) return null;
          const snapshot = snapshotByZone.get(zone);
          const stock = snapshot?.stock ?? 100;

          return (
            <VenueZoneMarker
              key={zone}
              zone={zone}
              lat={geo.lat}
              lng={geo.lng}
              stock={stock}
              color={markerColor(stock)}
              radius={14 + ((100 - stock) / 100) * 10}
              snapshot={snapshot}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
