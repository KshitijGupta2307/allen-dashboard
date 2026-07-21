import type { PlatformRow, RowStats, TatBucket } from "../../lib/reportAggregate";
import { TAT_BUCKET_OPTIONS } from "../../lib/reportAggregate";
import { formatInt, formatPct } from "../../lib/format";
import { platformColor } from "../../lib/colors";
import { Select } from "../Select";

interface PlatformBreakdownTableProps {
  rows: PlatformRow[];
  total: RowStats & { tatCount: number };
  tatBucket: TatBucket;
  onTatBucketChange: (bucket: TatBucket) => void;
}

export function PlatformBreakdownTable({ rows, total, tatBucket, onTatBucketChange }: PlatformBreakdownTableProps) {
  const tatLabel = TAT_BUCKET_OPTIONS.find((o) => o.value === tatBucket)?.label ?? "TAT";

  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] gap-3 flex-wrap">
        <div>
          <h3 className="text-[13px] font-semibold">Platform-wise summary</h3>
          <p className="text-[12px] text-[var(--text-muted)]">{rows.length} platforms</p>
        </div>
        <Select
          ariaLabel="Turnaround-time bucket"
          value={tatBucket}
          onChange={(v) => onTatBucketChange(v as TatBucket)}
          options={TAT_BUCKET_OPTIONS}
        />
      </div>
      <div className="overflow-x-auto thin-scroll">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--page)]">
              <th className="text-left font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Platform
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Scanned links
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Reported
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Removed
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Removal rate
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                Pending links
              </th>
              <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                {tatLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.platform} className="border-t border-[var(--border)] hover:bg-[var(--page)] transition-colors duration-100">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: platformColor(r.platform) }} />
                    {r.platform}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(r.linksSent)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(r.linksApproved)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(r.linksRemoved)}</td>
                <td className="px-3 py-2.5 text-right tabular font-medium">{formatPct(r.removalPct)}</td>
                <td className="px-3 py-2.5 text-right tabular">
                  {r.pending > 0 ? (
                    <span className="text-[var(--status-warning-text)] font-medium">{formatInt(r.pending)}</span>
                  ) : (
                    formatInt(r.pending)
                  )}
                </td>
                <td className="px-3 py-2.5 text-right tabular">{formatInt(r.tatCount)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--page)] font-semibold">
              <td className="px-3 py-2.5">Grand total</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(total.linksSent)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(total.linksApproved)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(total.linksRemoved)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatPct(total.removalPct)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(total.pending)}</td>
              <td className="px-3 py-2.5 text-right tabular">{formatInt(total.tatCount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
