import { useState } from "react";
import type { DayRow } from "../../lib/reportAggregate";
import { formatInt, formatPct } from "../../lib/format";
import { ChevronDownIcon } from "../icons";

interface DailyBreakdownTableProps {
  days: DayRow[];
}

export function DailyBreakdownTable({ days }: DailyBreakdownTableProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--page)] transition-colors duration-100"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold">Daily breakdown</h3>
          <span className="text-[11px] text-[var(--text-muted)] rounded-full border border-[var(--border)] px-2 py-0.5">
            {days.length} {days.length === 1 ? "day" : "days"}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
          {open ? "Hide" : "Show"} {days.length} days
          <ChevronDownIcon size={14} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] overflow-auto thin-scroll max-h-[420px]">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 z-10 bg-[var(--page)]">
              <tr>
                <th className="text-left font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                  Date
                </th>
                <th className="text-right font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] px-3 py-2.5 whitespace-nowrap">
                  Links sent
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
              {days.map((d) => (
                <tr key={d.label} className="border-t border-[var(--border)] hover:bg-[var(--page)] transition-colors duration-100">
                  <td className="px-3 py-2.5 whitespace-nowrap text-[var(--text-secondary)]">{d.label}</td>
                  <td className="px-3 py-2.5 text-right tabular">{formatInt(d.linksSent)}</td>
                  <td className="px-3 py-2.5 text-right tabular">{formatInt(d.linksApproved)}</td>
                  <td className="px-3 py-2.5 text-right tabular">{formatInt(d.linksRemoved)}</td>
                  <td className="px-3 py-2.5 text-right tabular">{formatInt(d.pending)}</td>
                  <td className="px-3 py-2.5 text-right tabular">{formatPct(d.removalPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
