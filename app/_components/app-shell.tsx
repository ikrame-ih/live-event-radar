"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const roleLabel = pathname.startsWith("/dashboard")
    ? "Live dashboard"
    : "Coordinator";

  return (
    <div className="min-h-screen bry-page-shell px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <a href="#main-content" className="bry-skip-link">
        Skip to content
      </a>
      <AppHeader roleLabel={roleLabel} />
      <div id="main-content" className="bry-page-content-area">
        {children}
      </div>
      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pb-4 text-xs text-(--text-secondary)">
        <span>Ikrame Ibn Hayoun</span>
        <span aria-hidden>·</span>
        <a
          href="https://ikrame-ih.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Portfolio (opens in a new tab)"
          className="underline-offset-2 hover:underline hover:text-(--text-primary) transition-colors"
        >
          Portfolio
        </a>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/ikrame-ih"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub (opens in a new tab)"
          className="underline-offset-2 hover:underline hover:text-(--text-primary) transition-colors"
        >
          GitHub
        </a>
        <span aria-hidden>·</span>
        <a
          href="https://www.linkedin.com/in/ikrame-ih/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn (opens in a new tab)"
          className="underline-offset-2 hover:underline hover:text-(--text-primary) transition-colors"
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}
