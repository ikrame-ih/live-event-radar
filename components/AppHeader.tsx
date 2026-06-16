"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, LayoutGrid, MapPin, Settings } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

type AppHeaderProps = {
  roleLabel?: string;
  criticalCount?: number;
};

export function AppHeader({
  roleLabel = "Coordinator",
  criticalCount = 0,
}: AppHeaderProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onDashboard = pathname.startsWith("/dashboard");
  const mapHref = onDashboard ? "/dashboard#venue-map" : "/#venue-map";

  return (
    <header className="bry-app-header bry-page-content mb-7 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:grid-rows-1">
      <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 sm:col-start-1">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-base font-extrabold tracking-tight"
        >
          <AppLogo size={28} className="shrink-0" />
          <span className="truncate">LiveEvent Radar</span>
        </Link>
        <span className="bry-role-pill hidden shrink-0 sm:inline">
          {roleLabel}
        </span>
      </div>

      <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-2 sm:col-start-3">
        <button
          type="button"
          className="bry-nav-icon relative"
          aria-label="Alerts"
        >
          <Bell size={20} strokeWidth={1.5} />
          {criticalCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--semantic-coral)]" />
          )}
        </button>
        <button
          type="button"
          className="bry-nav-icon hidden sm:flex"
          aria-label="Settings"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="bry-profile-avatar"
          aria-label="User profile"
        >
          <span className="flex flex-col items-center" aria-hidden>
            <span className="bry-profile-avatar-head" />
            <span className="bry-profile-avatar-body" />
          </span>
        </button>
      </div>

      <nav
        className="bry-header-nav bry-box bry-glass col-span-2 row-start-2 flex items-center justify-center gap-1 self-center px-2 py-1.5 sm:col-span-1 sm:col-start-2 sm:row-start-1"
        aria-label="Main"
      >
        <Link
          href="/"
          className={`bry-nav-icon ${onHome ? "bry-nav-icon-active" : ""}`}
          aria-label="Command Center"
          aria-current={onHome ? "page" : undefined}
        >
          <Home size={20} strokeWidth={1.5} />
        </Link>
        <Link
          href="/dashboard"
          className={`bry-nav-icon ${onDashboard ? "bry-nav-icon-active" : ""}`}
          aria-label="Event stream"
          aria-current={onDashboard ? "page" : undefined}
        >
          <LayoutGrid size={20} strokeWidth={1.5} />
        </Link>
        <Link href={mapHref} className="bry-nav-icon" aria-label="Venue map">
          <MapPin size={20} strokeWidth={1.5} />
        </Link>
      </nav>
    </header>
  );
}
