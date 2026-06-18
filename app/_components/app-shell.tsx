"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useEventStore } from "@/store/useEventStore";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const roleLabel = pathname.startsWith("/dashboard")
    ? "Telemetry"
    : "Coordinator";
  const criticalCount = useEventStore(
    (s) => s.incidents.filter((i) => i.severity === "critical").length
  );

  return (
    <div className="min-h-screen bry-page-shell px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <AppHeader roleLabel={roleLabel} criticalCount={criticalCount} />
      <div className="bry-page-content-area">{children}</div>
      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pb-4 text-xs text-(--text-muted)">
        <span>Ikrame Ibn Hayoun</span>
        <span aria-hidden>·</span>
        <a
          href="https://ikrame-ih.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--text-secondary) transition-colors"
        >
          Portfolio
        </a>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/ikrame-ih"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--text-secondary) transition-colors"
        >
          GitHub
        </a>
        <span aria-hidden>·</span>
        <a
          href="https://www.linkedin.com/in/ikrame-ih/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-(--text-secondary) transition-colors"
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
