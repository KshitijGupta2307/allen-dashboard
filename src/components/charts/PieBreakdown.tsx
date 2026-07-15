import { Cell, Pie, PieChart, type PieLabelRenderProps, ResponsiveContainer, Tooltip } from "recharts";
import type { Bucket } from "../../lib/aggregate";
import { ChartCard } from "../ChartCard";
import { ChartTooltipBody } from "./ChartTooltip";
import { formatInt } from "../../lib/format";

interface PieBreakdownProps {
  title: string;
  subtitle?: string;
  data: Bucket[];
  colorFor?: (label: string) => string;
  height?: number;
}

const MIN_LABEL_SHARE = 0.08;
const RADIAN = Math.PI / 180;

function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  if (!percent || percent < MIN_LABEL_SHARE) return null;
  const cxNum = Number(cx);
  const cyNum = Number(cy);
  const inner = Number(innerRadius);
  const outer = Number(outerRadius);
  const radius = inner + (outer - inner) * 0.55;
  const x = cxNum + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cyNum + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

export function PieBreakdown({ title, subtitle, data, colorFor, height = 300 }: PieBreakdownProps) {
  const fill = (label: string) => colorFor?.(label) ?? "var(--series-1)";
  const total = data.reduce((a, d) => a + d.count, 0) || 1;

  return (
    <ChartCard title={title} subtitle={subtitle} height={height}>
      <div className="h-full flex flex-col gap-2">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius="50%"
                outerRadius="78%"
                paddingAngle={2}
                stroke="var(--surface-1)"
                strokeWidth={2}
                isAnimationActive={false}
                label={renderSliceLabel}
                labelLine={false}
              >
                {data.map((d) => (
                  <Cell key={d.label} fill={fill(d.label)} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  const p = payload?.[0];
                  if (!p) return null;
                  const value = Number(p.value ?? 0);
                  const label = String(p.payload.label);
                  return (
                    <ChartTooltipBody
                      active={active}
                      title={label}
                      rows={[
                        { label: "Count", value: formatInt(value), color: fill(label) },
                        { label: "Share", value: `${((value / total) * 100).toFixed(1)}%`, color: fill(label) },
                      ]}
                    />
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 px-1">
          {data.map((d) => (
            <span key={d.label} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: fill(d.label) }} />
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
