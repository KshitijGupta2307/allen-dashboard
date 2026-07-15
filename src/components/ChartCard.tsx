import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  height?: number;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, height = 260, children }: ChartCardProps) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div>
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
