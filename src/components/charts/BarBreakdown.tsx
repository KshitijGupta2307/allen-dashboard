import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "../../lib/aggregate";
import { ChartCard } from "../ChartCard";
import { ChartTooltipBody } from "./ChartTooltip";
import { formatInt } from "../../lib/format";

interface BarBreakdownProps {
  title: string;
  subtitle?: string;
  data: Bucket[];
  /** Omit when bars represent one-off entities (e.g. individual accounts) with no shared identity to color by. */
  colorFor?: (label: string) => string;
  height?: number;
}

export function BarBreakdown({ title, subtitle, data, colorFor, height = 260 }: BarBreakdownProps) {
  const fill = (label: string) => colorFor?.(label) ?? "var(--series-1)";

  return (
    <ChartCard title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 16, left: 4 }} barCategoryGap="24%">
          <CartesianGrid stroke="var(--gridline)" vertical={false} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "var(--page)" }}
            content={({ active, payload }) => {
              const p = payload?.[0];
              if (!p) return null;
              return (
                <ChartTooltipBody
                  active={active}
                  title={String(p.payload.label)}
                  rows={[{ label: "Count", value: formatInt(Number(p.value ?? 0)), color: fill(String(p.payload.label)) }]}
                />
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((d) => (
              <Cell key={d.label} fill={fill(d.label)} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              formatter={(v) => formatInt(Number(v ?? 0))}
              style={{ fill: "var(--text-primary)", fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
