"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, LayoutGrid, MapPin, Settings } from "lucide-react";

type AppHeaderProps = {
  roleLabel?: string;
  criticalCount?: number;
};

export function AppHeader({ roleLabel = "Coordinator", criticalCount = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onDashboard = pathname.startsWith("/dashboard");
  const mapHref = onDashboard ? "/dashboard#venue-map" : "/#venue-map";

  return (
    <header className="mx-auto mb-5 flex max-w-[var(--content-max)] items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-base font-extrabold tracking-tight">
          LiveEvent Radar
        </Link>
        <span className="bry-role-pill hidden sm:inline">{roleLabel}</span>
      </div>

      <nav className="bry-box flex items-center gap-1 px-2 py-1.5" aria-label="Main">
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

      <div className="flex items-center gap-2">
        <button type="button" className="bry-nav-icon relative" aria-label="Alerts">
          <Bell size={20} strokeWidth={1.5} />
          {criticalCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--semantic-coral)]" />
          )}
        </button>
        <button type="button" className="bry-nav-icon hidden sm:flex" aria-label="Settings">
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "var(--gradient-cta)" }}
        >
          LR
        </div>
      </div>
    </header>
  );
}
