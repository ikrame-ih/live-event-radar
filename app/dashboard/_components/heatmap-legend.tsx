export function HeatmapLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ops-text-subtle)]">
      <span>Stand cluster density (30 s window)</span>
      <div className="flex items-center gap-2">
        <span>Low</span>
        <div
          className="h-2 w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--ops-heat-low) 0%, var(--ops-heat-mid) 50%, var(--ops-heat-high) 100%)",
          }}
          aria-hidden
        />
        <span>High</span>
      </div>
    </div>
  );
}
