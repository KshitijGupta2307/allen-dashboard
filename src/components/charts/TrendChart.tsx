import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekPoint } from "../../lib/aggregate";
import { ChartCard } from "../ChartCard";
import { ChartTooltipBody } from "./ChartTooltip";
import { formatInt } from "../../lib/format";

export function TrendChart({ data }: { data: WeekPoint[] }) {
  return (
    <ChartCard title="Submissions over time" subtitle="Weekly, submitted vs. removed" height={280}>
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] mb-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-[2px] rounded" style={{ background: "var(--series-1)" }} />
            Submitted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-[2px] rounded" style={{ background: "var(--status-good)" }} />
            Removed
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--gridline)" vertical={false} strokeWidth={1} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }}
              content={({ active, label, payload }) => (
                <ChartTooltipBody
                  active={active}
                  title={label as string}
                  rows={[
                    {
                      label: "Submitted",
                      value: formatInt(Number(payload?.find((p) => p.dataKey === "submitted")?.value ?? 0)),
                      color: "var(--series-1)",
                    },
                    {
                      label: "Removed",
                      value: formatInt(Number(payload?.find((p) => p.dataKey === "removed")?.value ?? 0)),
                      color: "var(--status-good)",
                    },
                  ]}
                />
              )}
            />
            <Line
              type="monotone"
              dataKey="submitted"
              stroke="var(--series-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface-1)" }}
            />
            <Line
              type="monotone"
              dataKey="removed"
              stroke="var(--status-good)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface-1)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
