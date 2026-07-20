import type { WeekRow, RowStats } from "../../lib/reportAggregate";
import { formatInt, formatPct } from "../../lib/format";
import { platformColor } from "../../lib/colors";

interface WeeklyPlatformTableProps {
  weeks: WeekRow[];
  overall: RowStats;
  columns: string[];
  monthLabel: string;
}

function RateBadge({ pct }: { pct: number }) {
  const tone = pct >= 0.95 ? "good" : pct >= 0.8 ? "warning" : "critical";
  const bg = `color-mix(in srgb, var(--status-${tone}) 14%, transparent)`;
  const fg = `var(--status-${tone}-text)`;
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: bg, color: fg }}>
      {formatPct(pct)}
    </span>
  );
}

export function WeeklyPlatformTable({ weeks, overall, columns, monthLabel }: WeeklyPlatformTableProps) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-[13px] font-semibold">Weekly breakdown by platform</h3>
          <p className="text-[12px] text-[var(--text-muted)]">{monthLabel}</p>
        </div>
      </div>
      <div className="overflow-x-auto thin-scroll">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--page)]">
              <th className="text-left font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Week
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: platformColor(c) }} />
                    {c}
                  </span>
                </th>
              ))}
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Links scanned
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Approved
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Removed
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Pending
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Removal %
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.label} className="border-t border-[var(--border)] hover:bg-[var(--page)] transition-colors duration-100">
                <td className="px-3 py-2.5 whitespace-nowrap text-[var(--text-secondary)]">{w.label}</td>
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2.5 text-right tabular">
                    {formatInt(w.byPlatform[c] ?? 0)}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right tabular font-medium">{formatInt(w.linksScanned)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(w.linksApproved)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(w.linksRemoved)}</td>
                <td className="px-3 py-2.5 text-right tabular">
                  {w.pending > 0 ? (
                    <span className="text-[var(--status-warning-text)] font-medium">{formatInt(w.pending)}</span>
                  ) : (
                    formatInt(w.pending)
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <RateBadge pct={w.removalPct} />
                </td>
              </tr>
            ))}
            <tr className="border-t border-[var(--border-strong)] bg-[var(--page)] font-semibold">
              <td className="px-3 py-2.5 whitespace-nowrap">Overall monthly</td>
              {columns.map((c) => (
                <td key={c} className="px-3 py-2.5 text-right tabular">
                  {formatInt(weeks.reduce((a, w) => a + (w.byPlatform[c] ?? 0), 0))}
                </td>
              ))}
              <td className="px-3 py-2.5 text-right tabular">{formatInt(overall.linksScanned)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(overall.linksApproved)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(overall.linksRemoved)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(overall.pending)}</td>
              <td className="px-3 py-2.5 text-right">
                <RateBadge pct={overall.removalPct} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
