"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { ZONE_NAMES } from "@/features/live-radar/lib/derive-incidents";
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  VENUE_CENTER,
  VENUE_MAP_ZOOM,
  ZONE_GEO,
} from "@/features/live-radar/lib/zone-geo";
import { deriveZoneSnapshots, stockHeat } from "@/features/live-radar/lib/zone-stock";
import { stockHeatMarkerColor } from "@/features/live-radar/lib/stock-heat-colors";
import { useNow } from "@/features/live-radar/hooks/use-now";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";
import { VenueZoneMarker } from "@/components/VenueZoneMarker";
import "leaflet/dist/leaflet.css";

function markerColor(stock: number): string {
  return stockHeatMarkerColor(stockHeat(stock));
}

/** Keep tiles sharp when the dashboard stretches the map panel to match Stock events. */
function MapInvalidateSize({ enabled }: { enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return undefined;
    const node = map.getContainer();
    const sync = () => map.invalidateSize({ animate: false });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    return () => ro.disconnect();
  }, [enabled, map]);

  return null;
}

export function VenueLeafletMap({
  focusedZone = null,
  fill = false,
}: {
  focusedZone?: string | null;
  fill?: boolean;
}) {
  const events = useTelemetryStore((state) => state.events);
  const now = useNow();

  const snapshots = useMemo(
    () => (now ? deriveZoneSnapshots(events, now) : []),
    [events, now]
  );
  const snapshotByZone = useMemo(
    () => new Map(snapshots.map((snapshot) => [snapshot.zone, snapshot])),
    [snapshots]
  );

  return (
    <div
      className={
        fill
          ? "venue-leaflet-map flex h-full min-h-[280px] flex-1 overflow-hidden rounded-[var(--radius-inner)]"
          : "venue-leaflet-map min-h-[360px] overflow-hidden rounded-[var(--radius-inner)]"
      }
      data-venue-leaflet-map
    >
      <MapContainer
        center={[VENUE_CENTER.lat, VENUE_CENTER.lng]}
        zoom={VENUE_MAP_ZOOM}
        scrollWheelZoom={false}
        className={
          fill ? "h-full min-h-[280px] w-full" : "h-[360px] w-full sm:h-[420px]"
        }
        aria-label="Venue map with live stock markers"
      >
        <MapInvalidateSize enabled={fill} />
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

        {ZONE_NAMES.map((zone) => {
          const geo = ZONE_GEO[zone];
          if (!geo) return null;
          const snapshot = snapshotByZone.get(zone);
          const stock = snapshot?.stock ?? 100;
          const isFocused = focusedZone === zone;

          return (
            <VenueZoneMarker
              key={zone}
              zone={zone}
              lat={geo.lat}
              lng={geo.lng}
              stock={stock}
              color={markerColor(stock)}
              radius={
                (14 + ((100 - stock) / 100) * 10) * (isFocused ? 1.25 : 1)
              }
              snapshot={snapshot}
              selected={isFocused}
              dimmed={Boolean(focusedZone) && !isFocused}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
