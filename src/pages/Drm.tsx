import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSheetTab } from "../hooks/useSheetTab";
import { fetchDrmTelegramSheet, fetchDrmYoutubeSheet, fetchDrmWebLinksSheet } from "../lib/sheets";
import { normalizeDrmTelegramRows, normalizeDrmYoutubeRows, normalizeDrmWebLinkRows, combineDrmRows } from "../lib/parse";
import { computeSimpleKpis, funnel, simpleStatus, tatHistogram, trendByWeek } from "../lib/aggregate";
import type { DrmRow, DrmSource, Status } from "../lib/types";
import { formatDate, formatInt, formatPct } from "../lib/format";
import { platformColor } from "../lib/colors";
import { DrmShell } from "../components/DrmShell";
import { StatTile } from "../components/StatTile";
import { LinkIcon, CheckCircleIcon, ShieldCheckIcon, ClockIcon } from "../components/icons";
import { StatusBadge } from "../components/StatusBadge";
import { MultiSelect } from "../components/MultiSelect";
import { StatusSelect } from "../components/StatusSelect";
import { TabViewSelect, type TabViewOption } from "../components/TabViewSelect";
import { TimelineDateFilter } from "../components/TimelineDateFilter";
import { RecordTable } from "../components/RecordTable";
import { LinkCell } from "../components/LinkCell";
import { TrendChart } from "../components/charts/TrendChart";
import { FunnelChart } from "../components/charts/FunnelChart";
import { TatChart } from "../components/charts/TatChart";
import { LoadingState, ErrorState } from "../components/StatusStates";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "removed", label: "Removed" },
  { value: "pending", label: "Pending" },
  { value: "not-reported", label: "Not reported" },
];

/** The DRM sheet's data tabs — "TG screenshots" is deliberately left out, it's proof
 * screenshots, not a data table. */
type Tab = "telegram" | "youtube" | "web-links" | "overall";

const TAB_OPTIONS: TabViewOption<Tab>[] = [
  { value: "telegram", label: "Telegram" },
  { value: "youtube", label: "YouTube" },
  { value: "web-links", label: "Web-Links" },
  { value: "overall", label: "Overall" },
];

const TAB_LOG_TITLE: Record<Tab, string> = {
  telegram: "Telegram log",
  youtube: "YouTube log",
  "web-links": "Web-Links log",
  overall: "Overall DRM log",
};

function SourceBadge({ value }: { value: DrmSource }) {
  const color = platformColor(value);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {value}
    </span>
  );
}

const columns: ColumnDef<DrmRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue<Date | null>()),
    sortingFn: "datetime",
  },
  { accessorKey: "source", header: "Source", cell: (info) => <SourceBadge value={info.getValue<DrmSource>()} /> },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "link", header: "Link", cell: (info) => <LinkCell value={info.getValue<string>()} /> },
  {
    accessorKey: "channelName",
    header: "Channel",
    cell: (info) => info.getValue<string>() || <span className="text-[var(--text-muted)]">—</span>,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => simpleStatus(row.reported, row.removed),
    cell: (info) => <StatusBadge status={info.getValue<Status>()} />,
  },
  {
    accessorKey: "tatDays",
    header: "TAT (d)",
    meta: { align: "right" },
    cell: (info) => info.getValue<number | null>() ?? <span className="text-[var(--text-muted)]">—</span>,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: (info) => info.getValue<string>() || <span className="text-[var(--text-muted)]">—</span>,
  },
];

function matchesStatus(row: { reported: boolean | null; removed: boolean | null }, statuses: Status[]): boolean {
  if (!statuses.length) return true;
  return statuses.includes(simpleStatus(row.reported, row.removed));
}

function matchesPlatform(row: { platform: string }, platforms: string[]): boolean {
  if (!platforms.length) return true;
  return platforms.includes(row.platform);
}

function matchesDateRange(row: { date: Date | null }, from: Date | null, to: Date | null): boolean {
  if (from && (!row.date || row.date < from)) return false;
  if (to && (!row.date || row.date > to)) return false;
  return true;
}

function maxDate(...dates: (Date | null)[]): Date | null {
  return dates.reduce<Date | null>((max, d) => (d && (!max || d > max) ? d : max), null);
}

export function Drm() {
  const telegram = useSheetTab(fetchDrmTelegramSheet, normalizeDrmTelegramRows);
  const youtube = useSheetTab(fetchDrmYoutubeSheet, normalizeDrmYoutubeRows);
  const webLinks = useSheetTab(fetchDrmWebLinksSheet, normalizeDrmWebLinkRows);

  const overallData = useMemo(
    () => combineDrmRows(telegram.data, youtube.data, webLinks.data),
    [telegram.data, youtube.data, webLinks.data],
  );

  const [tab, setTab] = useState<Tab>("telegram");
  const handleTabChange = (next: Tab) => {
    setTab(next);
    setPlatforms([]);
  };

  const active =
    tab === "telegram"
      ? telegram
      : tab === "youtube"
        ? youtube
        : tab === "web-links"
          ? webLinks
          : {
              data: overallData,
              loading: telegram.loading || youtube.loading || webLinks.loading,
              error: telegram.error ?? youtube.error ?? webLinks.error,
              lastUpdated: maxDate(telegram.lastUpdated, youtube.lastUpdated, webLinks.lastUpdated),
            };
  const data = active.data;
  const { loading, error, lastUpdated } = active;
  const refresh = () => {
    telegram.refresh();
    youtube.refresh();
    webLinks.refresh();
  };

  const [statusLabels, setStatusLabels] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const statuses = statusLabels as Status[];

  const platformOptions = useMemo(() => [...new Set(data.map((r) => r.platform))].sort(), [data]);

  const filtered = useMemo(
    () => data.filter((r) => matchesStatus(r, statuses) && matchesPlatform(r, platforms) && matchesDateRange(r, dateFrom, dateTo)),
    [data, statuses, platforms, dateFrom, dateTo],
  );

  const kpis = computeSimpleKpis(filtered);
  const trend = useMemo(() => trendByWeek(filtered), [filtered]);
  const funnelData = useMemo(() => funnel(filtered), [filtered]);
  const tatData = useMemo(() => tatHistogram(filtered), [filtered]);

  return (
    <DrmShell
      title="DRM"
      subtitle="Anti-piracy takedown tracker"
      lastUpdated={lastUpdated}
      loading={loading}
      onRefresh={refresh}
    >
      {loading && data.length === 0 && <LoadingState />}
      {error && data.length === 0 && <ErrorState message={error} onRetry={refresh} />}

      {(data.length > 0 || (!loading && !error)) && (
        <main className="flex-1 flex flex-col gap-4 px-6 py-4 max-w-[1400px] w-full mx-auto">
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <TabViewSelect label="Source" options={TAB_OPTIONS} value={tab} onChange={handleTabChange} />

            <div className="w-px h-5 bg-[var(--border)] mx-1" />

            <TimelineDateFilter
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />

            <div className="ml-auto flex items-center gap-2">
              <MultiSelect label="Platform" options={platformOptions} selected={platforms} onChange={setPlatforms} />
              <StatusSelect options={STATUS_OPTIONS} selected={statuses} onChange={setStatusLabels} />
            </div>
          </div>

          {error && <p className="text-[12px] text-[var(--status-critical)]">Last refresh failed: {error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label="Total scanned"
              value={formatInt(kpis.total)}
              accent="brand"
              icon={LinkIcon}
              trend={trend.map((t) => t.submitted)}
            />
            <StatTile
              label="Reported"
              value={formatPct(kpis.reportedPct)}
              sub={`${formatInt(kpis.reported)} of ${formatInt(kpis.total)}`}
              accent="info"
              icon={CheckCircleIcon}
            />
            <StatTile
              label="Removed"
              value={formatPct(kpis.removedPct)}
              sub={`${formatInt(kpis.removed)} of ${formatInt(kpis.reported)}`}
              accent="good"
              icon={ShieldCheckIcon}
              trend={trend.map((t) => t.removed)}
            />
            <StatTile
              label="Pending removal"
              value={formatInt(kpis.pending)}
              accent={kpis.pending > 0 ? "warning" : "neutral"}
              icon={ClockIcon}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrendChart data={trend} />
            </div>
            <FunnelChart data={funnelData} />
          </div>

          <TatChart data={tatData} />

          <RecordTable data={filtered} columns={columns} title={TAB_LOG_TITLE[tab]} initialSorting={[{ id: "date", desc: true }]} />
        </main>
      )}
    </DrmShell>
  );
}
