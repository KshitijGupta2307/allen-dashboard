import type { PlatformRow } from "../../lib/reportAggregate";
import { ChartCard } from "../ChartCard";
import { platformColor } from "../../lib/colors";
import { formatInt } from "../../lib/format";

interface PlatformContributionChartProps {
  rows: PlatformRow[];
}

export function PlatformContributionChart({ rows }: PlatformContributionChartProps) {
  const total = rows.reduce((a, r) => a + r.linksSent, 0);
  const segments = rows
    .map((r) => ({ platform: r.platform, value: r.linksSent, pct: total ? r.linksSent / total : 0 }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <ChartCard title="Platform wise contribution" subtitle="Share of scanned links by platform" height={200}>
      {total === 0 ? (
        <div className="h-full flex items-center justify-center text-[12px] text-[var(--text-muted)]">No data</div>
      ) : (
        <div className="h-full flex flex-col justify-center gap-4">
          <div className="flex w-full h-6 rounded-md overflow-hidden">
            {segments.map((s, i) => (
              <div
                key={s.platform}
                title={`${s.platform}: ${formatInt(s.value)} (${(s.pct * 100).toFixed(1)}%)`}
                style={{
                  width: `${s.pct * 100}%`,
                  background: platformColor(s.platform),
                  marginLeft: i === 0 ? 0 : 2,
                }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {segments.map((s) => (
              <li key={s.platform} className="flex items-center gap-1.5 text-[12px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: platformColor(s.platform) }} />
                <span className="text-[var(--text-secondary)]">{s.platform}</span>
                <span className="font-semibold tabular">{(s.pct * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
