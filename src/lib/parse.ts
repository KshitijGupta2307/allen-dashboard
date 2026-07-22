import type { DrmRow, ProjectWiseRow, ScrappedLinkRow, Submission } from "./types";

/** Sheet dates are entered as free-text d/m/yyyy (e.g. "28/8/2025", "06/03/2026"). */
export function parseDMY(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = Number(m[3]);
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function parseBool(raw: string): boolean | null {
  const s = raw.trim().toUpperCase();
  if (s === "TRUE") return true;
  if (s === "FALSE") return false;
  return null;
}

/** Handles messy manual entries: "4.8M", "2.5 M", "107k", "400", "0.0.", "" */
export function parseCount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/^(\d*\.?\d+)/);
  if (!m) return null;
  let num = parseFloat(m[1]);
  if (!Number.isFinite(num)) return null;
  const suffix = s.slice(m[0].length).trim();
  if (/^m/i.test(suffix)) num *= 1_000_000;
  else if (/^k/i.test(suffix)) num *= 1_000;
  return num;
}

export function parseIntSafe(raw: string, fallback: number): number {
  const s = raw.trim();
  if (!s) return fallback;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Turnaround time in whole days: removal date minus reporting date. Sheet's own TAT column is manually entered and unreliable. */
function diffDays(from: Date | null, to: Date | null): number | null {
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

const KNOWN_CONTENT_TYPES = new Set(["Defamation", "Copyright", "Piracy", "Impersonation"]);

function normalizePlatform(raw: string): string {
  const s = raw.trim();
  if (!s) return "Unknown";
  if (/^youtube$/i.test(s)) return "YouTube";
  if (/^linkedin$/i.test(s)) return "LinkedIn";
  return s;
}

function normalizeContentType(raw: string): string {
  const s = raw.trim();
  if (!s) return "Unspecified";
  if (KNOWN_CONTENT_TYPES.has(s)) return s;
  return "Other";
}

function normalizeLogo(raw: string): Submission["logoUsed"] {
  const s = raw.trim().toLowerCase();
  if (!s) return "Unknown";
  if (s.startsWith("yes")) return "Yes";
  if (s.includes("allen mentioned")) return "Mentioned";
  if (s.startsWith("no")) return "No";
  return "Unknown";
}

/**
 * Fixed column order in the "Submission" tab (the sheet has two columns
 * both literally named "Type" — position, not header text, is authoritative).
 */
const COL = {
  date: 0,
  platform: 1,
  contentType: 2,
  link: 3,
  channelId: 4,
  views: 5,
  likes: 6,
  reported: 7,
  reportingDate: 8,
  removed: 9,
  removalDate: 10,
  remarks: 11,
  subType: 12,
  account: 13,
  noOfLinks: 14,
  logoUsed: 15,
  tat: 16,
} as const;

const cell = (row: string[], idx: number) => (row[idx] ?? "").trim();

/** Trailer rows left over from checkbox formatting applied past the real data:
 * every cell is empty except Reported/Removed, which default to FALSE. */
function isBlankTrailerRow(row: string[]): boolean {
  return row.every((v) => {
    const s = (v ?? "").trim();
    return !s || s.toUpperCase() === "FALSE";
  });
}

export function normalizeRow(row: string[], id: number): Submission | null {
  if (isBlankTrailerRow(row)) return null;

  const dateRaw = cell(row, COL.date);
  const link = cell(row, COL.link);
  const channelId = cell(row, COL.channelId);
  /** Incomplete manual entries: no date, link, or channel to identify what was submitted —
   * same completeness guard as the Project Wise / Scrapped Links normalizers. */
  if (!dateRaw && !link && !channelId) return null;

  const reportingDate = parseDMY(cell(row, COL.reportingDate));
  const removalDate = parseDMY(cell(row, COL.removalDate));

  return {
    id,
    date: parseDMY(dateRaw),
    dateRaw,
    platform: normalizePlatform(cell(row, COL.platform)),
    contentType: normalizeContentType(cell(row, COL.contentType)),
    link,
    channelId,
    views: parseCount(cell(row, COL.views)),
    likes: parseCount(cell(row, COL.likes)),
    reported: parseBool(cell(row, COL.reported)),
    reportingDate,
    removed: parseBool(cell(row, COL.removed)),
    removalDate,
    remarks: cell(row, COL.remarks),
    subType: cell(row, COL.subType),
    account: cell(row, COL.account),
    noOfLinks: parseIntSafe(cell(row, COL.noOfLinks), 0),
    logoUsed: normalizeLogo(cell(row, COL.logoUsed)),
    tatDays: diffDays(reportingDate, removalDate),
  };
}

export function normalizeRows(rows: string[][]): Submission[] {
  const out: Submission[] = [];
  rows.forEach((row, i) => {
    const s = normalizeRow(row, i);
    if (s) out.push(s);
  });
  return out;
}

/** Fixed column order in the "Project Wise" tab — same position-based rule as COL above. */
const COL_PROJECT_WISE = {
  date: 0,
  platform: 1,
  link: 2,
  channelId: 3,
  followers: 4,
  category: 5,
  views: 6,
  likes: 7,
  videoName: 8,
  approval: 9,
  reported: 10,
  reportingDate: 11,
  removed: 12,
  removalDate: 13,
  logoVisible: 14,
  account: 15,
} as const;

export function normalizeProjectWiseRow(row: string[], id: number): ProjectWiseRow | null {
  const dateRaw = cell(row, COL_PROJECT_WISE.date);
  const link = cell(row, COL_PROJECT_WISE.link);
  const channelId = cell(row, COL_PROJECT_WISE.channelId);
  if (!dateRaw && !link && !channelId) return null;

  return {
    id,
    date: parseDMY(dateRaw),
    dateRaw,
    platform: normalizePlatform(cell(row, COL_PROJECT_WISE.platform)),
    link,
    channelId,
    followers: parseCount(cell(row, COL_PROJECT_WISE.followers)),
    category: cell(row, COL_PROJECT_WISE.category),
    views: parseCount(cell(row, COL_PROJECT_WISE.views)),
    likes: parseCount(cell(row, COL_PROJECT_WISE.likes)),
    videoName: cell(row, COL_PROJECT_WISE.videoName),
    approval: parseBool(cell(row, COL_PROJECT_WISE.approval)),
    reported: parseBool(cell(row, COL_PROJECT_WISE.reported)),
    reportingDate: parseDMY(cell(row, COL_PROJECT_WISE.reportingDate)),
    removed: parseBool(cell(row, COL_PROJECT_WISE.removed)),
    removalDate: parseDMY(cell(row, COL_PROJECT_WISE.removalDate)),
    logoVisible: cell(row, COL_PROJECT_WISE.logoVisible),
    account: cell(row, COL_PROJECT_WISE.account),
  };
}

export function normalizeProjectWiseRows(rows: string[][]): ProjectWiseRow[] {
  const out: ProjectWiseRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeProjectWiseRow(row, i);
    if (r) out.push(r);
  });
  return out;
}

/**
 * Fixed column order in the "Scrapped Links" tab — position, not header text, is
 * authoritative (the header row itself has a stray misaligned cell).
 */
const COL_SCRAPPED_LINKS = {
  date: 0,
  platform: 1,
  type: 2,
  link: 3,
  channelId: 4,
  noOfLinks: 5,
  videoType: 6,
  topic: 7,
  views: 8,
  videoName: 9,
  subscribers: 10,
  channelType: 11,
  autoApproval: 12,
  approval: 13,
  reported: 14,
  reportingDate: 15,
  removed: 16,
  removalDate: 17,
  tat: 18,
  remarks: 19,
  logoVisible: 20,
} as const;

export function normalizeScrappedLinkRow(row: string[], id: number): ScrappedLinkRow | null {
  const dateRaw = cell(row, COL_SCRAPPED_LINKS.date);
  const link = cell(row, COL_SCRAPPED_LINKS.link);
  const channelId = cell(row, COL_SCRAPPED_LINKS.channelId);
  if (!dateRaw && !link && !channelId) return null;

  const reportingDate = parseDMY(cell(row, COL_SCRAPPED_LINKS.reportingDate));
  const removalDate = parseDMY(cell(row, COL_SCRAPPED_LINKS.removalDate));

  return {
    id,
    date: parseDMY(dateRaw),
    dateRaw,
    platform: normalizePlatform(cell(row, COL_SCRAPPED_LINKS.platform)),
    type: normalizeContentType(cell(row, COL_SCRAPPED_LINKS.type)),
    link,
    channelId,
    noOfLinks: parseIntSafe(cell(row, COL_SCRAPPED_LINKS.noOfLinks), 0),
    videoType: cell(row, COL_SCRAPPED_LINKS.videoType),
    topic: cell(row, COL_SCRAPPED_LINKS.topic),
    views: parseCount(cell(row, COL_SCRAPPED_LINKS.views)),
    videoName: cell(row, COL_SCRAPPED_LINKS.videoName),
    subscribers: parseCount(cell(row, COL_SCRAPPED_LINKS.subscribers)),
    channelType: cell(row, COL_SCRAPPED_LINKS.channelType),
    autoApproval: parseBool(cell(row, COL_SCRAPPED_LINKS.autoApproval)),
    approval: parseBool(cell(row, COL_SCRAPPED_LINKS.approval)),
    reported: parseBool(cell(row, COL_SCRAPPED_LINKS.reported)),
    reportingDate,
    removed: parseBool(cell(row, COL_SCRAPPED_LINKS.removed)),
    removalDate,
    tatDays: diffDays(reportingDate, removalDate),
    remarks: cell(row, COL_SCRAPPED_LINKS.remarks),
    logoVisible: cell(row, COL_SCRAPPED_LINKS.logoVisible),
  };
}

export function normalizeScrappedLinkRows(rows: string[][]): ScrappedLinkRow[] {
  const out: ScrappedLinkRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeScrappedLinkRow(row, i);
    if (r) out.push(r);
  });
  return out;
}

/** Fixed column order in the DRM sheet's "Telegram" tab — channel-level rows (one row per
 * channel, not per link). Two columns are both literally titled "Channel Removed"; the second
 * (14), sitting right next to Removal Date, is the authoritative one — position, not header
 * text, is what matters, same rule the ORM tabs use. */
const COL_DRM_TELEGRAM = {
  date: 0,
  category: 1,
  channelName: 2,
  link: 3,
  subscribers: 4,
  linksScanned: 5,
  reported: 7,
  reportingDate: 8,
  piracyStatus: 13,
  removed: 14,
  removalDate: 15,
} as const;

export function normalizeDrmTelegramRow(row: string[], id: number): DrmRow | null {
  const dateRaw = cell(row, COL_DRM_TELEGRAM.date);
  const link = cell(row, COL_DRM_TELEGRAM.link);
  const channelName = cell(row, COL_DRM_TELEGRAM.channelName);
  if (!dateRaw && !link && !channelName) return null;

  const reportingDate = parseDMY(cell(row, COL_DRM_TELEGRAM.reportingDate));
  const removalDate = parseDMY(cell(row, COL_DRM_TELEGRAM.removalDate));

  return {
    id: `tg-${id}`,
    source: "Telegram",
    date: parseDMY(dateRaw),
    dateRaw,
    platform: "Telegram",
    category: cell(row, COL_DRM_TELEGRAM.category),
    link,
    channelName,
    subscribers: parseCount(cell(row, COL_DRM_TELEGRAM.subscribers)),
    views: null,
    linksScanned: parseIntSafe(cell(row, COL_DRM_TELEGRAM.linksScanned), 0),
    noOfLinks: 1,
    reported: parseBool(cell(row, COL_DRM_TELEGRAM.reported)),
    reportingDate,
    removed: parseBool(cell(row, COL_DRM_TELEGRAM.removed)),
    removalDate,
    tatDays: diffDays(reportingDate, removalDate),
    remarks: cell(row, COL_DRM_TELEGRAM.piracyStatus),
  };
}

export function normalizeDrmTelegramRows(rows: string[][]): DrmRow[] {
  const out: DrmRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeDrmTelegramRow(row, i);
    if (r) out.push(r);
  });
  return out;
}

/** Fixed column order in the DRM sheet's "YouTube" tab — per-video rows. */
const COL_DRM_YOUTUBE = {
  date: 0,
  category: 1,
  link: 2,
  channelId: 3,
  subscribers: 4,
  views: 5,
  noOfLinks: 6,
  reported: 8,
  reportingDate: 9,
  removed: 10,
  removalDate: 11,
  remarks: 12,
} as const;

export function normalizeDrmYoutubeRow(row: string[], id: number): DrmRow | null {
  const dateRaw = cell(row, COL_DRM_YOUTUBE.date);
  const link = cell(row, COL_DRM_YOUTUBE.link);
  const channelName = cell(row, COL_DRM_YOUTUBE.channelId);
  if (!dateRaw && !link && !channelName) return null;

  const reportingDate = parseDMY(cell(row, COL_DRM_YOUTUBE.reportingDate));
  const removalDate = parseDMY(cell(row, COL_DRM_YOUTUBE.removalDate));

  return {
    id: `yt-${id}`,
    source: "YouTube",
    date: parseDMY(dateRaw),
    dateRaw,
    platform: "YouTube",
    category: cell(row, COL_DRM_YOUTUBE.category),
    link,
    channelName,
    subscribers: parseCount(cell(row, COL_DRM_YOUTUBE.subscribers)),
    views: parseCount(cell(row, COL_DRM_YOUTUBE.views)),
    linksScanned: null,
    noOfLinks: parseIntSafe(cell(row, COL_DRM_YOUTUBE.noOfLinks), 0),
    reported: parseBool(cell(row, COL_DRM_YOUTUBE.reported)),
    reportingDate,
    removed: parseBool(cell(row, COL_DRM_YOUTUBE.removed)),
    removalDate,
    tatDays: diffDays(reportingDate, removalDate),
    remarks: cell(row, COL_DRM_YOUTUBE.remarks),
  };
}

export function normalizeDrmYoutubeRows(rows: string[][]): DrmRow[] {
  const out: DrmRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeDrmYoutubeRow(row, i);
    if (r) out.push(r);
  });
  return out;
}

/** Fixed column order in the DRM sheet's "Web-Links" tab — per-link rows across misc. sites
 * (Scribd, Google Drive, etc.), unlike Telegram/YouTube this tab has its own Platform column. */
const COL_DRM_WEBLINKS = {
  date: 0,
  platform: 1,
  link: 2,
  channelName: 3,
  noOfLinks: 4,
  reported: 6,
  reportingDate: 7,
  removed: 8,
  removalDate: 9,
} as const;

export function normalizeDrmWebLinkRow(row: string[], id: number): DrmRow | null {
  const dateRaw = cell(row, COL_DRM_WEBLINKS.date);
  const link = cell(row, COL_DRM_WEBLINKS.link);
  const channelName = cell(row, COL_DRM_WEBLINKS.channelName);
  if (!dateRaw && !link && !channelName) return null;

  const reportingDate = parseDMY(cell(row, COL_DRM_WEBLINKS.reportingDate));
  const removalDate = parseDMY(cell(row, COL_DRM_WEBLINKS.removalDate));

  return {
    id: `wl-${id}`,
    source: "Web-Links",
    date: parseDMY(dateRaw),
    dateRaw,
    platform: cell(row, COL_DRM_WEBLINKS.platform) || "Weblink",
    category: "",
    link,
    channelName,
    subscribers: null,
    views: null,
    linksScanned: null,
    noOfLinks: parseIntSafe(cell(row, COL_DRM_WEBLINKS.noOfLinks), 0),
    reported: parseBool(cell(row, COL_DRM_WEBLINKS.reported)),
    reportingDate,
    removed: parseBool(cell(row, COL_DRM_WEBLINKS.removed)),
    removalDate,
    tatDays: diffDays(reportingDate, removalDate),
    remarks: "",
  };
}

export function normalizeDrmWebLinkRows(rows: string[][]): DrmRow[] {
  const out: DrmRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeDrmWebLinkRow(row, i);
    if (r) out.push(r);
  });
  return out;
}

export function combineDrmRows(telegram: DrmRow[], youtube: DrmRow[], webLinks: DrmRow[]): DrmRow[] {
  return [...telegram, ...youtube, ...webLinks];
}

export function normalizeDrmRows(rows: string[][]): DrmRow[] {
  const out: DrmRow[] = [];
  rows.forEach((row, i) => {
    const r = normalizeDrmRow(row, i);
    if (r) out.push(r);
  });
  return out;
}
