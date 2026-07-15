import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FunnelStage } from "../../lib/aggregate";
import { ChartCard } from "../ChartCard";
import { ChartTooltipBody } from "./ChartTooltip";
import { formatInt } from "../../lib/format";

const STAGE_COLOR = ["var(--seq-450)", "var(--seq-500)", "var(--seq-600)"];

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  const base = data[0]?.value || 1;

  return (
    <ChartCard title="Takedown funnel" subtitle="Submitted → reported → removed" height={200}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }} barCategoryGap="30%">
          <XAxis type="number" hide domain={[0, base]} />
          <YAxis
            type="category"
            dataKey="stage"
            tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "var(--page)" }}
            content={({ active, payload }) => {
              const p = payload?.[0];
              if (!p) return null;
              const v = Number(p.value ?? 0);
              return (
                <ChartTooltipBody
                  active={active}
                  title={String(p.payload.stage)}
                  rows={[
                    { label: "Count", value: formatInt(v), color: "var(--seq-500)" },
                    { label: "% of submitted", value: `${((v / base) * 100).toFixed(1)}%`, color: "var(--seq-500)" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((d, i) => (
              <Cell key={d.stage} fill={STAGE_COLOR[i % STAGE_COLOR.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => {
                const n = Number(v ?? 0);
                return `${formatInt(n)} (${((n / base) * 100).toFixed(0)}%)`;
              }}
              style={{ fill: "var(--text-primary)", fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
