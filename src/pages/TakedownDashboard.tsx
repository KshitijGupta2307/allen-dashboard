import { useMemo, useState } from "react";
import { useSubmissions } from "../hooks/useSubmissions";
import type { Filters } from "../lib/types";
import { computeKpis, filterSubmissions, funnel, tatHistogram, trendByWeek } from "../lib/aggregate";
import { formatCompact, formatInt, formatPct } from "../lib/format";
import { AppShell } from "../components/AppShell";
import { FilterBar } from "../components/FilterBar";
import { StatTile } from "../components/StatTile";
import { TrendChart } from "../components/charts/TrendChart";
import { FunnelChart } from "../components/charts/FunnelChart";
import { TatChart } from "../components/charts/TatChart";
import { DataTable } from "../components/DataTable";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";

const EMPTY_FILTERS: Filters = { from: null, to: null, platforms: [], contentTypes: [], statuses: [] };

export function TakedownDashboard() {
  const { data, loading, error, lastUpdated, refresh } = useSubmissions();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const platforms = useMemo(() => [...new Set(data.map((s) => s.platform))].sort(), [data]);
  const contentTypes = useMemo(() => [...new Set(data.map((s) => s.contentType))].sort(), [data]);
  const maxDate = useMemo(
    () => data.reduce<Date | null>((max, s) => (s.date && (!max || s.date > max) ? s.date : max), null),
    [data],
  );

  const filtered = useMemo(() => filterSubmissions(data, filters), [data, filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const trend = useMemo(() => trendByWeek(filtered), [filtered]);
  const funnelData = useMemo(() => funnel(filtered), [filtered]);
  const tatData = useMemo(() => tatHistogram(filtered), [filtered]);

  return (
    <AppShell
      title="Takedown Ops"
      subtitle="Submission tracker"
      route="dashboard"
      lastUpdated={lastUpdated}
      loading={loading}
      onRefresh={refresh}
    >
      {loading && data.length === 0 && <LoadingState />}
      {error && data.length === 0 && <ErrorState message={error} onRetry={refresh} />}

      {(data.length > 0 || (!loading && !error)) && (
        <main className="flex-1 flex flex-col gap-4 px-6 py-4 max-w-[1400px] w-full mx-auto">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            platforms={platforms}
            contentTypes={contentTypes}
            maxDate={maxDate}
            resultCount={filtered.length}
          />

          {error && <p className="text-[12px] text-[var(--status-critical)]">Last refresh failed: {error}</p>}

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatTile
                  label="Total submissions"
                  value={formatInt(kpis.totalNoOfLinks)}
                  sub={`${formatInt(kpis.total)} records`}
                />
                <StatTile
                  label="Reported"
                  value={formatPct(kpis.reportedPct)}
                  sub={`${formatInt(kpis.reported)} of ${formatInt(kpis.total)}`}
                />
                <StatTile
                  label="Removed"
                  value={formatPct(kpis.removedPct)}
                  sub={`${formatInt(kpis.removed)} of ${formatInt(kpis.total)}`}
                  accent="good"
                />
                <StatTile
                  label="Pending removal"
                  value={formatInt(kpis.pending)}
                  accent={kpis.pending > 0 ? "warning" : "neutral"}
                />
                <StatTile label="Views on submitted content" value={formatCompact(kpis.totalViewsSubmitted)} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <TrendChart data={trend} />
                </div>
                <FunnelChart data={funnelData} />
              </div>

              <TatChart data={tatData} />

              <DataTable data={filtered} />
            </>
          )}
        </main>
      )}
    </AppShell>
  );
}
