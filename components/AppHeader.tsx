"use client";

import { TransitionLink } from "@/components/TransitionLink";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

type AppHeaderProps = {
  roleLabel?: string;
};

export function AppHeader({ roleLabel = "Coordinator" }: AppHeaderProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="bry-app-header bry-page-content mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="col-start-1 flex min-w-0 items-center gap-3">
        <TransitionLink
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-base tracking-tight"
        >
          <AppLogo size={28} className="shrink-0" />
          <span className="bry-brand-mark truncate text-base">LiveEvent Radar</span>
        </TransitionLink>
        <span className="bry-role-pill hidden shrink-0 sm:inline">
          {roleLabel}
        </span>
      </div>

      <nav
        className="bry-header-nav bry-box col-start-2 flex items-center justify-center gap-1 justify-self-end px-2 py-1.5 sm:col-start-2 sm:justify-self-center"
        aria-label="Main"
      >
        <TransitionLink
          href="/"
          className={`bry-nav-icon ${onHome ? "bry-nav-icon-active" : ""}`}
          aria-label="Command Center"
          aria-current={onHome ? "page" : undefined}
        >
          <Home size={20} strokeWidth={1.5} />
        </TransitionLink>
        <TransitionLink
          href="/dashboard"
          className={`bry-nav-icon ${onDashboard ? "bry-nav-icon-active" : ""}`}
          aria-label="Live dashboard"
          aria-current={onDashboard ? "page" : undefined}
        >
          <LayoutGrid size={20} strokeWidth={1.5} />
        </TransitionLink>
      </nav>
    </header>
  );
}
