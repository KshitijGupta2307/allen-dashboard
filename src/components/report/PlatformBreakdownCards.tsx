import { useMemo, useState } from "react";
import type { PlatformRow } from "../../lib/reportAggregate";
import { formatInt, formatPct } from "../../lib/format";
import { platformColor, platformIcon } from "../../lib/colors";

interface PlatformBreakdownCardsProps {
  rows: PlatformRow[];
  subtitle: string;
}

function ratePct(r: PlatformRow): number {
  return Math.round(r.removalPct * 1000) / 10;
}

function Pill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[12px] font-medium rounded-full border px-3 py-1.5 transition-colors duration-150 whitespace-nowrap"
      style={
        active && color
          ? {
              borderColor: color,
              color,
              background: `color-mix(in srgb, ${color} 8%, transparent)`,
            }
          : {
              borderColor: "var(--border)",
              color: "var(--text-muted)",
              background: "transparent",
            }
      }
    >
      {label}
    </button>
  );
}

function PlatformCard({ row }: { row: PlatformRow }) {
  const color = platformColor(row.platform);
  const Icon = platformIcon(row.platform);
  const rate = ratePct(row);

  return (
    <div
      className="relative rounded-2xl border bg-[var(--surface-1)] p-4 flex flex-col gap-3.5 overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />

      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-semibold text-[14px]" style={{ color }}>
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
            style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
          >
            <Icon size={15} strokeWidth={2} />
          </span>
          {row.platform}
        </span>
        <span
          className="text-[12px] font-semibold rounded-full px-2.5 py-1 tabular"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          {rate.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Scanned</span>
          <span className="text-[15px] font-bold tabular text-[var(--text-primary)] truncate">{formatInt(row.linksScanned)}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Approved</span>
          <span className="text-[15px] font-bold tabular text-[var(--series-2)] truncate">{formatInt(row.linksApproved)}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Removed</span>
          <span className="text-[15px] font-bold tabular text-[var(--status-good)] truncate">{formatInt(row.linksRemoved)}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[9.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Rate</span>
          <span className="text-[15px] font-bold tabular truncate" style={{ color: "var(--status-warning)" }}>
            {formatPct(row.removalPct)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <span>Removal rate</span>
          <span className="tabular" style={{ color }}>
            {formatPct(row.removalPct)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--page)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

export function PlatformBreakdownCards({ rows, subtitle }: PlatformBreakdownCardsProps) {
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  const allSelected = deselected.size === 0;

  const togglePlatform = (platform: string) => {
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const visibleRows = useMemo(() => rows.filter((r) => !deselected.has(r.platform)), [rows, deselected]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Platform breakdown</h2>
          <p className="text-[12px] text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Pill
            label={allSelected ? "Deselect all" : "Select all"}
            active={false}
            onClick={() => setDeselected(allSelected ? new Set(rows.map((r) => r.platform)) : new Set())}
          />
          {rows.map((r) => (
            <Pill
              key={r.platform}
              label={r.platform}
              color={platformColor(r.platform)}
              active={!deselected.has(r.platform)}
              onClick={() => togglePlatform(r.platform)}
            />
          ))}
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-8 text-center text-[12px] text-[var(--text-muted)]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          No platforms selected
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleRows.map((r) => (
            <PlatformCard key={r.platform} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}
