/** Teatinos campus area, Málaga — demo activation footprint. */
export const VENUE_CENTER = { lat: 36.7165, lng: -4.4735 } as const;

export const ZONE_GEO: Record<
  string,
  { lat: number; lng: number; short: string }
> = {
  "South Gate": { lat: 36.7149, lng: -4.4764, short: "SG" },
  "Sampling Court": { lat: 36.7171, lng: -4.4728, short: "SC" },
  "Main Stage Walkway": { lat: 36.7183, lng: -4.4698, short: "MSW" },
};

export const VENUE_MAP_ZOOM = 16;
