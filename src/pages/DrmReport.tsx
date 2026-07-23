import { useMemo, useState } from "react";
import { useSheetTab } from "../hooks/useSheetTab";
import { fetchDrmTelegramSheet, fetchDrmYoutubeSheet, fetchDrmWebLinksSheet } from "../lib/sheets";
import { normalizeDrmTelegramRows, normalizeDrmYoutubeRows, normalizeDrmWebLinkRows, combineDrmRows } from "../lib/parse";
import { AppShell } from "../components/AppShell";
import { StatTile } from "../components/StatTile";
import { LinkIcon, CheckCircleIcon, ShieldCheckIcon, ClockIcon, GaugeIcon } from "../components/icons";
import { SingleSelect } from "../components/SingleSelect";
import { Select } from "../components/Select";
import { WeeklyPlatformTable } from "../components/report/WeeklyPlatformTable";
import { PlatformBreakdownCards } from "../components/report/PlatformBreakdownCards";
import { PlatformBreakdownTable } from "../components/report/PlatformBreakdownTable";
import { PlatformContributionChart } from "../components/charts/PlatformContributionChart";
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
  type ReportableRow,
  type TatBucket,
} from "../lib/reportAggregate";

function monthKeyOf(year: number, month: number): string {
  return `${year}-${month}`;
}

/** Excludes stray future-dated rows (typo'd years etc.) from counting as "latest" —
 * the default should be the real current month, not whatever sorts last in the data. */
function isNotAfterToday(year: number, month: number): boolean {
  const now = new Date();
  return year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());
}

type Source = "telegram" | "youtube" | "web-links" | "overall";

const SOURCE_OPTIONS: { value: Source; label: string }[] = [
  { value: "telegram", label: "Telegram" },
  { value: "youtube", label: "YouTube" },
  { value: "web-links", label: "Web-Links" },
  { value: "overall", label: "Overall" },
];

function maxDate(...dates: (Date | null)[]): Date | null {
  return dates.reduce<Date | null>((max, d) => (d && (!max || d > max) ? d : max), null);
}

export function DrmReport() {
  const telegram = useSheetTab(fetchDrmTelegramSheet, normalizeDrmTelegramRows);
  const youtube = useSheetTab(fetchDrmYoutubeSheet, normalizeDrmYoutubeRows);
  const webLinks = useSheetTab(fetchDrmWebLinksSheet, normalizeDrmWebLinkRows);

  const overallData = useMemo(
    () => combineDrmRows(telegram.data, youtube.data, webLinks.data),
    [telegram.data, youtube.data, webLinks.data],
  );

  const [source, setSource] = useState<Source>("overall");
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [tatBucket, setTatBucket] = useState<TatBucket>("1");

  const handleSourceChange = (next: Source) => {
    setSource(next);
    setMonthKey(null);
  };

  const active =
    source === "telegram"
      ? telegram
      : source === "youtube"
        ? youtube
        : source === "web-links"
          ? webLinks
          : {
              data: overallData,
              loading: telegram.loading || youtube.loading || webLinks.loading,
              error: telegram.error ?? youtube.error ?? webLinks.error,
              lastUpdated: maxDate(telegram.lastUpdated, youtube.lastUpdated, webLinks.lastUpdated),
            };
  const data = active.data as ReportableRow[];
  const { loading, error, lastUpdated } = active;
  const refresh = () => {
    telegram.refresh();
    youtube.refresh();
    webLinks.refresh();
  };

  const months = useMemo(() => availableMonths(data), [data]);

  const selected = useMemo(() => {
    const found = monthKey ? months.find((o) => monthKeyOf(o.year, o.month) === monthKey) : null;
    if (found) return found;
    return months.find((o) => isNotAfterToday(o.year, o.month)) ?? months[0] ?? null;
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
      title="Report"
      subtitle="Monthly takedown performance summary"
      route="drm-report"
      lastUpdated={lastUpdated}
      loading={loading}
      onRefresh={refresh}
    >
      {loading && data.length === 0 && <LoadingState />}
      {error && data.length === 0 && <ErrorState message={error} onRetry={refresh} />}

      {(data.length > 0 || (!loading && !error)) && (
        <main className="flex-1 flex flex-col gap-5 px-6 py-4 max-w-[1400px] w-full mx-auto">
          {error && <p className="text-[12px] text-[var(--status-critical)]">Last refresh failed: {error}</p>}

          <div
            className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <SingleSelect label="Source" options={SOURCE_OPTIONS} value={source} onChange={handleSourceChange} />

            {selected && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--text-muted)]">Reporting period</span>
                <Select
                  ariaLabel="Report month"
                  value={monthKeyOf(selected.year, selected.month)}
                  onChange={setMonthKey}
                  options={months.map((o) => ({ value: monthKeyOf(o.year, o.month), label: o.label }))}
                />
              </div>
            )}
          </div>

          {!selected ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <StatTile
                  label="Total scanned"
                  value={formatInt(overall.linksScanned)}
                  accent="brand"
                  icon={LinkIcon}
                  trend={weeks.map((w) => w.linksScanned)}
                />
                <StatTile
                  label="Total reported"
                  value={formatInt(overall.linksApproved)}
                  accent="info"
                  icon={CheckCircleIcon}
                  trend={weeks.map((w) => w.linksApproved)}
                />
                <StatTile
                  label="Total removed"
                  value={formatInt(overall.linksRemoved)}
                  accent="good"
                  icon={ShieldCheckIcon}
                  trend={weeks.map((w) => w.linksRemoved)}
                />
                <StatTile
                  label="Pending removal"
                  value={formatInt(overall.pending)}
                  accent={overall.pending > 0 ? "warning" : "neutral"}
                  icon={ClockIcon}
                />
                <StatTile
                  label="Removal %"
                  value={formatPct(overall.removalPct)}
                  sub={`${formatInt(overall.linksRemoved)} of ${formatInt(overall.linksApproved)}`}
                  accent="good"
                  icon={GaugeIcon}
                />
              </div>

              <PlatformBreakdownCards
                rows={platformRows}
                subtitle={`Performance across all DRM sources — ${selected.label}`}
              />

              <WeeklyPlatformTable weeks={weeks} overall={overall} columns={columns} monthLabel={selected.label} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2">
                  <PlatformBreakdownTable
                    rows={platformRows}
                    total={overall}
                    tatBucket={tatBucket}
                    onTatBucketChange={setTatBucket}
                  />
                </div>
                <PlatformContributionChart rows={platformRows} />
              </div>

              <DailyBreakdownTable days={days} />
            </>
          )}
        </main>
      )}
    </AppShell>
  );
}
