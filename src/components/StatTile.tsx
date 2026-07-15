interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "good" | "warning" | "critical" | "neutral";
}

const ACCENT_VAR: Record<NonNullable<StatTileProps["accent"]>, string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
  neutral: "var(--text-primary)",
};

export function StatTile({ label, value, sub, accent = "neutral" }: StatTileProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3.5 flex flex-col gap-1.5 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {accent !== "neutral" && (
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: ACCENT_VAR[accent] }} />
      )}
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <span className="text-[28px] font-semibold leading-none" style={{ color: ACCENT_VAR[accent] }}>
        {value}
      </span>
      {sub && <span className="text-[12px] text-[var(--text-muted)]">{sub}</span>}
    </div>
  );
}
