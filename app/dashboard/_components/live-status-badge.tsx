"use client";

type LiveStatusBadgeProps = {
  simulatorOnly: boolean;
  wsConnected: boolean;
};

export function LiveStatusBadge({
  simulatorOnly,
  wsConnected,
}: LiveStatusBadgeProps) {
  const live = !simulatorOnly && wsConnected;
  const label = live ? "Live" : "Simulator";
  const detail = live ? "WebSocket" : "Mock · 1/s";

  return (
    <div
      role="status"
      className="bry-inset inline-flex items-center gap-2.5 px-4 py-2 text-sm"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
          style={{ background: live ? "var(--semantic-teal)" : "var(--gradient-start)" }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: live ? "var(--semantic-teal)" : "var(--gradient-start)" }}
        />
      </span>
      <span className="font-semibold">{label}</span>
      <span className="text-[var(--text-muted)]">· {detail}</span>
    </div>
  );
}
