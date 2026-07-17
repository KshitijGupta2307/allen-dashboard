import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "../../lib/aggregate";
import { ChartCard } from "../ChartCard";
import { ChartTooltipBody } from "./ChartTooltip";
import { formatInt } from "../../lib/format";

export function TatChart({ data }: { data: Bucket[] }) {
  return (
    <ChartCard title="Turnaround time" subtitle="Days from report to removal (0-4d)" height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -16 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--gridline)" vertical={false} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "var(--page)" }}
            content={({ active, payload }) => {
              const p = payload?.[0];
              if (!p) return null;
              return (
                <ChartTooltipBody
                  active={active}
                  title={String(p.payload.label)}
                  rows={[{ label: "Submissions", value: formatInt(Number(p.value ?? 0)), color: "var(--series-1)" }]}
                />
              );
            }}
          />
          <Bar dataKey="count" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={40}>
            <LabelList
              dataKey="count"
              position="top"
              formatter={(v) => {
                const n = Number(v ?? 0);
                return n ? formatInt(n) : "";
              }}
              style={{ fill: "var(--text-primary)", fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
