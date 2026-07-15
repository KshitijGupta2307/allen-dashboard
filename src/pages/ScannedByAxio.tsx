import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { fetchProjectWiseSheet, fetchScrappedLinksSheet } from "../lib/sheets";
import { normalizeProjectWiseRows, normalizeScrappedLinkRows } from "../lib/parse";
import { useSheetTab } from "../hooks/useSheetTab";
import { computeSimpleKpis, countBy, funnel, simpleStatus, tatHistogram, trendByWeek } from "../lib/aggregate";
import { platformColor, contentTypeColor } from "../lib/colors";
import { formatDate, formatInt, formatPct } from "../lib/format";
import type { ProjectWiseRow, ScrappedLinkRow, Status } from "../lib/types";
import { Header } from "../components/Header";
import { StatTile } from "../components/StatTile";
import { StatusBadge } from "../components/StatusBadge";
import { MultiSelect } from "../components/MultiSelect";
import { DateRangePicker } from "../components/DateRangePicker";
import { RecordTable } from "../components/RecordTable";
import { TrendChart } from "../components/charts/TrendChart";
import { FunnelChart } from "../components/charts/FunnelChart";
import { PieBreakdown } from "../components/charts/PieBreakdown";
import { TatChart } from "../components/charts/TatChart";
import { LoadingState, ErrorState } from "../components/StatusStates";

type Tab = "project-wise" | "scrapped-links";

function LinkCell({ value }: { value: string }) {
  if (!value) return <span className="text-[var(--text-muted)]">—</span>;
  return (
    <span className="block max-w-[260px] truncate" title={value}>
      <a href={value} target="_blank" rel="noreferrer" className="text-[var(--series-1)] hover:underline">
        {value}
      </a>
    </span>
  );
}

const projectWiseColumns: ColumnDef<ProjectWiseRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue<Date | null>()),
    sortingFn: "datetime",
  },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "link", header: "Link", cell: (info) => <LinkCell value={info.getValue<string>()} /> },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => simpleStatus(row.reported, row.removed),
    cell: (info) => <StatusBadge status={info.getValue<Status>()} />,
  },
];

const scrappedLinksColumns: ColumnDef<ScrappedLinkRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue<Date | null>()),
    sortingFn: "datetime",
  },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "link", header: "Link", cell: (info) => <LinkCell value={info.getValue<string>()} /> },
  {
    accessorKey: "channelId",
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
    cell: (info) => info.getValue<number | null>() ?? <span className="text-[var(--text-muted)]">—</span>,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: (info) => info.getValue<string>() || <span className="text-[var(--text-muted)]">—</span>,
  },
];

const STATUS_LABELS = ["Removed", "Pending", "Not reported"];
const LABEL_TO_STATUS: Record<string, Status> = {
  Removed: "removed",
  Pending: "pending",
  "Not reported": "not-reported",
};

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

const TAB_BTN =
  "text-[12px] rounded-md px-2.5 py-1.5 border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)] transition-colors duration-150";
const TAB_BTN_ACTIVE = "text-[12px] rounded-md px-2.5 py-1.5 border border-[var(--series-1)] bg-[var(--series-1)] text-white transition-colors duration-150";

export function ScannedByAxio() {
  const projectWise = useSheetTab(fetchProjectWiseSheet, normalizeProjectWiseRows);
  const scrappedLinks = useSheetTab(fetchScrappedLinksSheet, normalizeScrappedLinkRows);
  const [tab, setTab] = useState<Tab>("project-wise");
  const [statusLabels, setStatusLabels] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const statuses = useMemo(() => statusLabels.map((l) => LABEL_TO_STATUS[l]), [statusLabels]);

  const handleTabChange = (next: Tab) => {
    setTab(next);
    setPlatforms([]);
  };

  const active = tab === "project-wise" ? projectWise : scrappedLinks;

  const platformOptions = useMemo(
    () => [...new Set(active.data.map((r) => r.platform))].sort(),
    [active.data],
  );

  const filteredProjectWise = useMemo(
    () =>
      projectWise.data.filter(
        (r) => matchesStatus(r, statuses) && matchesPlatform(r, platforms) && matchesDateRange(r, dateFrom, dateTo),
      ),
    [projectWise.data, statuses, platforms, dateFrom, dateTo],
  );
  const filteredScrappedLinks = useMemo(
    () =>
      scrappedLinks.data.filter(
        (r) => matchesStatus(r, statuses) && matchesPlatform(r, platforms) && matchesDateRange(r, dateFrom, dateTo),
      ),
    [scrappedLinks.data, statuses, platforms, dateFrom, dateTo],
  );

  const activeRows: (ProjectWiseRow | ScrappedLinkRow)[] = tab === "project-wise" ? filteredProjectWise : filteredScrappedLinks;
  const kpis = computeSimpleKpis(activeRows);
  const trend = useMemo(() => trendByWeek(activeRows), [activeRows]);
  const funnelData = useMemo(() => funnel(activeRows), [activeRows]);
  const byPlatform = useMemo(() => countBy(activeRows, (r) => r.platform, 6), [activeRows]);
  const byCategory = useMemo(
    () =>
      countBy(
        activeRows,
        (r) => (tab === "project-wise" ? (r as ProjectWiseRow).category || "Uncategorized" : (r as ScrappedLinkRow).type),
        6,
      ),
    [activeRows, tab],
  );
  const tatData = useMemo(
    () => (tab === "scrapped-links" ? tatHistogram(filteredScrappedLinks) : []),
    [tab, filteredScrappedLinks],
  );

  const refresh = () => {
    projectWise.refresh();
    scrappedLinks.refresh();
  };

  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Scanned by Axio"
        subtitle="Project-wise & scrapped link sweeps"
        route="scanned-by-axio"
        lastUpdated={active.lastUpdated}
        loading={active.loading}
        onRefresh={refresh}
      />

      {active.loading && active.data.length === 0 && <LoadingState />}
      {active.error && active.data.length === 0 && <ErrorState message={active.error} onRetry={refresh} />}

      {(active.data.length > 0 || (!active.loading && !active.error)) && (
        <main className="flex-1 flex flex-col gap-4 px-6 py-4 max-w-[1400px] w-full mx-auto">
          <div
            className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTabChange("project-wise")}
                className={tab === "project-wise" ? TAB_BTN_ACTIVE : TAB_BTN}
              >
                Project Wise
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("scrapped-links")}
                className={tab === "scrapped-links" ? TAB_BTN_ACTIVE : TAB_BTN}
              >
                Scrapped Links
              </button>
            </div>

            <div className="w-px h-5 bg-[var(--border)] mx-1" />

            <DateRangePicker from={dateFrom} to={dateTo} onChange={(from, to) => { setDateFrom(from); setDateTo(to); }} />

            <div className="ml-auto flex items-center gap-2">
              <MultiSelect label="Platform" options={platformOptions} selected={platforms} onChange={setPlatforms} />
              <MultiSelect label="Status" options={STATUS_LABELS} selected={statusLabels} onChange={setStatusLabels} />
            </div>
          </div>

          {active.error && (
            <p className="text-[12px] text-[var(--status-critical)]">Last refresh failed: {active.error}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label="Total records" value={formatInt(kpis.total)} />
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TrendChart data={trend} />
            </div>
            <FunnelChart data={funnelData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PieBreakdown title="By platform" data={byPlatform} colorFor={platformColor} />
            <PieBreakdown
              title={tab === "project-wise" ? "By category" : "By type"}
              data={byCategory}
              colorFor={contentTypeColor}
            />
            {tab === "scrapped-links" && <TatChart data={tatData} />}
          </div>

          {tab === "project-wise" ? (
            <RecordTable
              data={filteredProjectWise}
              columns={projectWiseColumns}
              title="Project wise log"
              initialSorting={[{ id: "date", desc: true }]}
            />
          ) : (
            <RecordTable
              data={filteredScrappedLinks}
              columns={scrappedLinksColumns}
              title="Scrapped links log"
              initialSorting={[{ id: "date", desc: true }]}
            />
          )}
        </main>
      )}
    </div>
  );
}
