interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  title?: string;
  rows: TooltipRow[];
}

export function ChartTooltipBody({ active, title, rows }: ChartTooltipProps) {
  if (!active || !rows.length) return null;
  return (
    <div className="rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-lg px-3 py-2 text-[12px] min-w-[140px]">
      {title && <div className="text-[var(--text-secondary)] mb-1">{title}</div>}
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="inline-block w-2.5 h-[2px] rounded" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-semibold text-[var(--text-primary)] tabular">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
