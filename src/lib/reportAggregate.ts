import type { Submission } from "./types";

export interface MonthOption {
  year: number;
  month: number;
  label: string;
}

function ordinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function ordinal(n: number): string {
  return `${n}${ordinalSuffix(n)}`;
}

/** Distinct year/month pairs present in the data, most recent first. */
export function availableMonths(data: Submission[]): MonthOption[] {
  const seen = new Map<string, MonthOption>();
  for (const s of data) {
    if (!s.date) continue;
    const year = s.date.getFullYear();
    const month = s.date.getMonth();
    const key = `${year}-${month}`;
    if (!seen.has(key)) {
      seen.set(key, { year, month, label: s.date.toLocaleDateString(undefined, { month: "long", year: "numeric" }) });
    }
  }
  return [...seen.values()].sort((a, b) => b.year - a.year || b.month - a.month);
}

export function filterByMonth(data: Submission[], year: number, month: number): Submission[] {
  return data.filter((s) => s.date && s.date.getFullYear() === year && s.date.getMonth() === month);
}

/** Top platforms by volume, remainder folded into "Other" so wide platform mixes stay readable. */
export function platformColumns(rows: Submission[], max = 5): string[] {
  const counts = new Map<string, number>();
  for (const s of rows) counts.set(s.platform, (counts.get(s.platform) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p);
  if (sorted.length <= max) return sorted;
  return [...sorted.slice(0, max - 1), "Other"];
}

function bucketPlatform(platform: string, columns: string[]): string {
  if (columns.includes(platform)) return platform;
  return columns.includes("Other") ? "Other" : platform;
}

export interface RowStats {
  linksSent: number;
  linksApproved: number;
  linksRemoved: number;
  pending: number;
  removalPct: number;
}

function computeRowStats(rows: Submission[]): RowStats {
  const linksSent = rows.reduce((a, s) => a + s.noOfLinks, 0);
  const linksApproved = rows.filter((s) => s.reported).length;
  const linksRemoved = rows.filter((s) => s.removed).length;
  const pending = rows.filter((s) => s.reported && !s.removed).length;
  return {
    linksSent,
    linksApproved,
    linksRemoved,
    pending,
    removalPct: linksApproved ? linksRemoved / linksApproved : 0,
  };
}

export interface WeekRow extends RowStats {
  label: string;
  byPlatform: Record<string, number>;
}

/** Fixed 7-day blocks from the 1st of the month (not calendar weeks) — matches "Week 1, 1st-7th" style reporting. */
export function weeklyByPlatform(rows: Submission[], year: number, month: number, columns: string[]): WeekRow[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthAbbr = new Date(year, month, 1).toLocaleDateString(undefined, { month: "short" });
  const weeks: WeekRow[] = [];
  for (let start = 1; start <= daysInMonth; start += 7) {
    const end = Math.min(start + 6, daysInMonth);
    const weekRows = rows.filter((s) => s.date!.getDate() >= start && s.date!.getDate() <= end);
    const byPlatform: Record<string, number> = Object.fromEntries(columns.map((c) => [c, 0]));
    for (const s of weekRows) byPlatform[bucketPlatform(s.platform, columns)] += 1;
    weeks.push({
      label: `Week ${weeks.length + 1}, From ${ordinal(start)} ${monthAbbr} to ${ordinal(end)} ${monthAbbr}`,
      byPlatform,
      ...computeRowStats(weekRows),
    });
  }
  return weeks;
}

export type TatBucket = "1" | "2" | "3" | "4plus";

export const TAT_BUCKET_OPTIONS: { value: TatBucket; label: string }[] = [
  { value: "1", label: "1 day TAT" },
  { value: "2", label: "2 days TAT" },
  { value: "3", label: "3 days TAT" },
  { value: "4plus", label: "4+ days TAT" },
];

function matchesTatBucket(days: number, bucket: TatBucket): boolean {
  if (bucket === "1") return days <= 1;
  if (bucket === "2") return days === 2;
  if (bucket === "3") return days === 3;
  return days >= 4;
}

function tatCount(rows: Submission[], bucket: TatBucket): number {
  return rows.filter((s) => s.removed && s.tatDays !== null && matchesTatBucket(s.tatDays, bucket)).length;
}

export interface PlatformRow extends RowStats {
  platform: string;
  tatCount: number;
}

export function platformBreakdown(rows: Submission[], columns: string[], bucket: TatBucket): PlatformRow[] {
  return columns.map((platform) => {
    const platRows = rows.filter((s) => bucketPlatform(s.platform, columns) === platform);
    return { platform, tatCount: tatCount(platRows, bucket), ...computeRowStats(platRows) };
  });
}

export function totalRow(rows: Submission[], bucket: TatBucket): RowStats & { tatCount: number } {
  return { tatCount: tatCount(rows, bucket), ...computeRowStats(rows) };
}

export interface DayRow extends RowStats {
  label: string;
  date: Date;
}

/** Only days with at least one record are included, so a sparse month doesn't pad out the list with zero rows. */
export function dailyBreakdown(rows: Submission[], year: number, month: number): DayRow[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out: DayRow[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayRows = rows.filter((s) => s.date!.getDate() === day);
    if (!dayRows.length) continue;
    out.push({
      label: new Date(year, month, day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      date: new Date(year, month, day),
      ...computeRowStats(dayRows),
    });
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime());
}
