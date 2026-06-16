import type { ReactNode } from "react";

type DashboardPanelProps = {
  title: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function DashboardPanel({
  title,
  subtitle,
  className = "",
  bodyClassName = "",
  children,
}: DashboardPanelProps) {
  return (
    <section
      className={`ops-card overflow-hidden rounded-2xl ${className}`}
    >
      <header className="border-b border-[var(--ops-border)] bg-[var(--ops-surface-muted)] px-5 py-3 transition-colors duration-250">
        <h2 className="text-base font-semibold text-[var(--ops-text-primary)] lg:text-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--ops-text-subtle)]">
            {subtitle}
          </p>
        )}
      </header>
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
