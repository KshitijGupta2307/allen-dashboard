import type { ComponentType } from "react";
import type { IconProps } from "./icons";

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "good" | "warning" | "critical" | "info" | "brand" | "violet" | "neutral";
  icon?: ComponentType<IconProps>;
  /** Optional recent series (e.g. weekly values) rendered as a small sparkline. */
  trend?: number[];
}

const ACCENT_VAR: Record<NonNullable<StatTileProps["accent"]>, string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
  info: "var(--series-2)",
  brand: "var(--series-1)",
  violet: "var(--series-5)",
  neutral: "var(--text-primary)",
};

const ICON_COLOR: Record<NonNullable<StatTileProps["accent"]>, string> = {
  ...ACCENT_VAR,
  neutral: "var(--text-muted)",
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 68;
  const h = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const line = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <polyline points={area} fill={color} opacity={0.14} stroke="none" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatTile({ label, value, sub, accent = "neutral", icon: Icon, trend }: StatTileProps) {
  const color = ACCENT_VAR[accent];
  const iconColor = ICON_COLOR[accent];
  const showTrend = trend && trend.length > 1;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {accent !== "neutral" && (
        <span
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 40%, transparent))` }}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
        {Icon && (
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ background: `color-mix(in srgb, ${iconColor} 14%, transparent)`, color: iconColor }}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[22px] sm:text-[26px] xl:text-[30px] font-bold leading-none tracking-tight tabular truncate"
            style={{ color: accent === "neutral" ? "var(--text-primary)" : color }}
          >
            {value}
          </span>
          {sub && <span className="text-[12px] text-[var(--text-muted)]">{sub}</span>}
        </div>
        {showTrend && <Sparkline data={trend} color={iconColor} />}
      </div>
    </div>
  );
}
