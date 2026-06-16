"use client";

import { Search } from "lucide-react";
import { ZONE_NAMES } from "@/features/live-radar/lib/derive-incidents";

export type StreamFilters = {
  search: string;
  zone: string;
  status: "all" | "spike" | "normal";
};

type EventStreamFiltersProps = {
  filters: StreamFilters;
  onChange: (next: StreamFilters) => void;
};

export function EventStreamFilters({ filters, onChange }: EventStreamFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bry-search-whisper flex items-center gap-3 px-5 py-3.5">
        <Search size={18} strokeWidth={1.5} className="shrink-0 text-[var(--text-muted)]" />
        <input
          type="search"
          placeholder="Search zone or item…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="All zones"
          active={filters.zone === "all"}
          onClick={() => onChange({ ...filters, zone: "all" })}
        />
        {ZONE_NAMES.map((zone) => (
          <FilterPill
            key={zone}
            label={zone.split(" ")[0]}
            active={filters.zone === zone}
            onClick={() => onChange({ ...filters, zone })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="All events"
          active={filters.status === "all"}
          onClick={() => onChange({ ...filters, status: "all" })}
        />
        <FilterPill
          label="Spikes"
          active={filters.status === "spike"}
          onClick={() => onChange({ ...filters, status: "spike" })}
        />
        <FilterPill
          label="Normal"
          active={filters.status === "normal"}
          onClick={() => onChange({ ...filters, status: "normal" })}
        />
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-200 ease-[var(--ease-premium)] ${
        active
          ? "bg-[var(--text-primary)] text-white shadow-[var(--shadow-row)]"
          : "bry-inset text-[var(--text-secondary)] hover:-translate-y-px hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );
}
