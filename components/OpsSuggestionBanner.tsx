import type { RestockSuggestion } from "@/features/live-radar/lib/suggest-restock";

type OpsSuggestionBannerProps = {
  suggestion: RestockSuggestion;
};

/**
 * Single decisive ops nudge — intentionally not a list of tips.
 * Depth over feature count: one recommended move tied to live stock + ETA.
 */
export function OpsSuggestionBanner({ suggestion }: OpsSuggestionBannerProps) {
  return (
    <aside
      className="bry-box bry-ops-suggestion mb-4 px-4 py-3 sm:px-5"
      aria-label="Restock suggestion"
      data-ops-suggestion
    >
      <p className="bry-caps m-0 text-[11px] text-(--text-muted)">Suggested move</p>
      <p className="m-0 mt-1 text-sm font-semibold text-(--text-primary)">
        Transfer ~{suggestion.units} units: {suggestion.fromZone} →{" "}
        {suggestion.toZone}
      </p>
      <p className="m-0 mt-1 text-xs text-(--text-secondary)">{suggestion.reason}</p>
    </aside>
  );
}
