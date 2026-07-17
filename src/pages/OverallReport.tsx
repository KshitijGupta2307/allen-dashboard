import { useMemo, useState } from "react";
import { useSubmissions } from "../hooks/useSubmissions";
import { AppShell } from "../components/AppShell";
import { StatTile } from "../components/StatTile";
import { Select } from "../components/Select";
import { WeeklyPlatformTable } from "../components/report/WeeklyPlatformTable";
import { PlatformBreakdownTable } from "../components/report/PlatformBreakdownTable";
import { DailyBreakdownTable } from "../components/report/DailyBreakdownTable";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";
import { formatInt, formatPct } from "../lib/format";
import {
  availableMonths,
  filterByMonth,
  platformColumns,
  weeklyByPlatform,
  platformBreakdown,
  totalRow,
  dailyBreakdown,
  type TatBucket,
} from "../lib/reportAggregate";

function monthKeyOf(year: number, month: number): string {
  return `${year}-${month}`;
}

export function OverallReport() {
  const { data, loading, error, lastUpdated, refresh } = useSubmissions();
  const months = useMemo(() => availableMonths(data), [data]);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [tatBucket, setTatBucket] = useState<TatBucket>("1");

  const selected = useMemo(() => {
    const found = monthKey ? months.find((o) => monthKeyOf(o.year, o.month) === monthKey) : null;
    return found ?? months[0] ?? null;
  }, [monthKey, months]);

  const monthRows = useMemo(
    () => (selected ? filterByMonth(data, selected.year, selected.month) : []),
    [data, selected],
  );
  const columns = useMemo(() => platformColumns(monthRows), [monthRows]);
  const weeks = useMemo(
    () => (selected ? weeklyByPlatform(monthRows, selected.year, selected.month, columns) : []),
    [monthRows, selected, columns],
  );
  const overall = useMemo(() => totalRow(monthRows, tatBucket), [monthRows, tatBucket]);
  const platformRows = useMemo(() => platformBreakdown(monthRows, columns, tatBucket), [monthRows, columns, tatBucket]);
  const days = useMemo(
    () => (selected ? dailyBreakdown(monthRows, selected.year, selected.month) : []),
    [monthRows, selected],
  );

  return (
    <AppShell
      title="Overall Report"
      subtitle="Monthly performance summary"
      route="overall-report"
      lastUpdated={lastUpdated}
      loading={loading}
      onRefresh={refresh}
    >
      {loading && data.length === 0 && <LoadingState />}
      {error && data.length === 0 && <ErrorState message={error} onRetry={refresh} />}

      {(data.length > 0 || (!loading && !error)) && (
        <main className="flex-1 flex flex-col gap-4 px-6 py-4 max-w-[1400px] w-full mx-auto">
          {error && <p className="text-[12px] text-[var(--status-critical)]">Last refresh failed: {error}</p>}

          {!selected ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[12px] text-[var(--text-muted)]">Weekly breakdown by platform — previous months</p>
                <Select
                  ariaLabel="Report month"
                  value={monthKeyOf(selected.year, selected.month)}
                  onChange={setMonthKey}
                  options={months.map((o) => ({ value: monthKeyOf(o.year, o.month), label: o.label }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatTile label="Total links sent" value={formatInt(overall.linksSent)} />
                <StatTile label="Total approved" value={formatInt(overall.linksApproved)} />
                <StatTile label="Total removed" value={formatInt(overall.linksRemoved)} accent="good" />
                <StatTile
                  label="Pending links"
                  value={formatInt(overall.pending)}
                  accent={overall.pending > 0 ? "warning" : "neutral"}
                />
                <StatTile label="Removal %" value={formatPct(overall.removalPct)} accent="good" />
              </div>

              <WeeklyPlatformTable weeks={weeks} overall={overall} columns={columns} monthLabel={selected.label} />

              <PlatformBreakdownTable rows={platformRows} total={overall} tatBucket={tatBucket} onTatBucketChange={setTatBucket} />

              <DailyBreakdownTable days={days} />
            </>
          )}
        </main>
      )}
    </AppShell>
  );
}
