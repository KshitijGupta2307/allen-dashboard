import type { CombinedRow, Filters, ProjectWiseRow, ScrappedLinkRow, Status, Submission } from "./types";

/** Turnaround time in whole days: removal date minus reporting date. */
function diffDays(from: Date | null, to: Date | null): number | null {
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function simpleStatus(reported: boolean | null, removed: boolean | null): Status {
  if (removed) return "removed";
  if (reported) return "pending";
  return "not-reported";
}

export function statusOf(s: Submission): Status {
  return simpleStatus(s.reported, s.removed);
}

export function matchesFilters(s: Submission, f: Filters): boolean {
  if (f.from && (!s.date || s.date < f.from)) return false;
  if (f.to && (!s.date || s.date > f.to)) return false;
  if (f.platforms.length && !f.platforms.includes(s.platform)) return false;
  if (f.contentTypes.length && !f.contentTypes.includes(s.contentType)) return false;
  if (f.statuses.length && !f.statuses.includes(statusOf(s))) return false;
  return true;
}

export function filterSubmissions(data: Submission[], f: Filters): Submission[] {
  return data.filter((s) => matchesFilters(s, f));
}

export interface Kpis {
  total: number;
  totalNoOfLinks: number;
  reported: number;
  reportedPct: number;
  removed: number;
  removedPct: number;
  pending: number;
  avgTatDays: number | null;
  totalLinksActioned: number;
  totalViewsSubmitted: number;
}

/** Reported/removed/pending are weighted by "No. of Links" — one row can represent several
 * links — so they stay consistent with the link-based Total submissions figure. */
export function computeKpis(data: Submission[]): Kpis {
  const total = data.length;
  const totalNoOfLinks = data.reduce((a, s) => a + s.noOfLinks, 0);
  const reported = data.filter((s) => s.reported).reduce((a, s) => a + s.noOfLinks, 0);
  const removed = data.filter((s) => s.removed).reduce((a, s) => a + s.noOfLinks, 0);
  const pending = data.filter((s) => statusOf(s) === "pending").reduce((a, s) => a + s.noOfLinks, 0);
  const tats = data.map((s) => s.tatDays).filter((v): v is number => v !== null);
  const avgTatDays = tats.length ? tats.reduce((a, b) => a + b, 0) / tats.length : null;
  const totalLinksActioned = removed;
  const totalViewsSubmitted = data.reduce((a, s) => a + (s.views ?? 0), 0);
  return {
    total,
    totalNoOfLinks,
    reported,
    reportedPct: totalNoOfLinks ? reported / totalNoOfLinks : 0,
    removed,
    removedPct: reported ? removed / reported : 0,
    pending,
    avgTatDays,
    totalLinksActioned,
    totalViewsSubmitted,
  };
}

export interface SimpleKpis {
  total: number;
  reported: number;
  reportedPct: number;
  removed: number;
  removedPct: number;
  pending: number;
}

export function computeSimpleKpis(data: { reported: boolean | null; removed: boolean | null }[]): SimpleKpis {
  const total = data.length;
  const reported = data.filter((d) => d.reported).length;
  const removed = data.filter((d) => d.removed).length;
  const pending = data.filter((d) => simpleStatus(d.reported, d.removed) === "pending").length;
  return {
    total,
    reported,
    reportedPct: total ? reported / total : 0,
    removed,
    removedPct: reported ? removed / reported : 0,
    pending,
  };
}

export function combineRows(projectWise: ProjectWiseRow[], scrappedLinks: ScrappedLinkRow[]): CombinedRow[] {
  const fromProjectWise: CombinedRow[] = projectWise.map((r) => ({
    id: `pw-${r.id}`,
    source: "Project Wise",
    date: r.date,
    dateRaw: r.dateRaw,
    platform: r.platform,
    link: r.link,
    channelId: r.channelId,
    views: r.views,
    reported: r.reported,
    reportingDate: r.reportingDate,
    removed: r.removed,
    removalDate: r.removalDate,
    tatDays: diffDays(r.reportingDate, r.removalDate),
    remarks: "",
  }));
  const fromScrappedLinks: CombinedRow[] = scrappedLinks.map((r) => ({
    id: `sl-${r.id}`,
    source: "Scrapped Links",
    date: r.date,
    dateRaw: r.dateRaw,
    platform: r.platform,
    link: r.link,
    channelId: r.channelId,
    views: r.views,
    reported: r.reported,
    reportingDate: r.reportingDate,
    removed: r.removed,
    removalDate: r.removalDate,
    tatDays: r.tatDays,
    remarks: r.remarks,
  }));
  return [...fromProjectWise, ...fromScrappedLinks];
}

export interface Bucket {
  label: string;
  count: number;
}

export function countBy<T>(data: T[], key: (item: T) => string, topN = 8, bucketOther = true): Bucket[] {
  const m = new Map<string, number>();
  for (const item of data) {
    const k = key(item);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
  if (!bucketOther) return sorted.slice(0, topN).map(([label, count]) => ({ label, count }));
  if (sorted.length <= topN) return sorted.map(([label, count]) => ({ label, count }));
  const head = sorted.slice(0, topN - 1);
  const restCount = sorted.slice(topN - 1).reduce((a, [, v]) => a + v, 0);
  return [...head.map(([label, count]) => ({ label, count })), { label: "Other", count: restCount }];
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - day);
  return copy;
}

export interface WeekPoint {
  weekStart: Date;
  label: string;
  submitted: number;
  removed: number;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Labels the bucket by the actual data it holds (earliest–latest date present), not the
 * calendar week's Monday — a filtered range that starts mid-week would otherwise show a
 * label before the selected "from" date, making it look like out-of-range data leaked in. */
function rangeLabel(min: Date, max: Date): string {
  return min.getTime() === max.getTime() ? shortDate(min) : `${shortDate(min)}–${shortDate(max)}`;
}

interface WeekAccumulator extends WeekPoint {
  minDate: Date;
  maxDate: Date;
}

export function trendByWeek<T extends { date: Date | null; removed: boolean | null }>(data: T[]): WeekPoint[] {
  const m = new Map<string, WeekAccumulator>();
  for (const item of data) {
    if (!item.date) continue;
    const ws = startOfWeek(item.date);
    const key = ws.toISOString();
    if (!m.has(key)) {
      m.set(key, { weekStart: ws, label: "", submitted: 0, removed: 0, minDate: item.date, maxDate: item.date });
    }
    const p = m.get(key)!;
    p.submitted += 1;
    if (item.removed) p.removed += 1;
    if (item.date < p.minDate) p.minDate = item.date;
    if (item.date > p.maxDate) p.maxDate = item.date;
  }
  return [...m.values()]
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((p) => ({ weekStart: p.weekStart, label: rangeLabel(p.minDate, p.maxDate), submitted: p.submitted, removed: p.removed }));
}

export interface FunnelStage {
  stage: string;
  value: number;
  /** Percentage of the previous stage (100 for the first stage) — same basis as the KPI tiles. */
  pct: number;
}

export function funnel(data: { reported: boolean | null; removed: boolean | null }[]): FunnelStage[] {
  const submitted = data.length;
  const reported = data.filter((s) => s.reported).length;
  const removed = data.filter((s) => s.removed).length;
  return [
    { stage: "Submitted", value: submitted, pct: 100 },
    { stage: "Reported", value: reported, pct: submitted ? (reported / submitted) * 100 : 0 },
    { stage: "Removed", value: removed, pct: reported ? (removed / reported) * 100 : 0 },
  ];
}

export function tatHistogram(data: { tatDays: number | null }[]): Bucket[] {
  const bands: [number, number, string][] = [
    [0, 0, "0d"],
    [1, 1, "1d"],
    [2, 2, "2d"],
    [3, 3, "3d"],
    [4, 4, "4d"],
  ];
  const counts = bands.map(([, , label]) => ({ label, count: 0 }));
  for (const s of data) {
    if (s.tatDays === null) continue;
    const idx = bands.findIndex(([lo, hi]) => s.tatDays! >= lo && s.tatDays! <= hi);
    if (idx >= 0) counts[idx].count += 1;
  }
  return counts;
}
