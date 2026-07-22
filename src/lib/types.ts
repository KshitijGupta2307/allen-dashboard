export interface Submission {
  id: number;
  date: Date | null;
  dateRaw: string;
  platform: string;
  contentType: string;
  link: string;
  channelId: string;
  views: number | null;
  likes: number | null;
  reported: boolean | null;
  reportingDate: Date | null;
  removed: boolean | null;
  removalDate: Date | null;
  remarks: string;
  subType: string;
  account: string;
  noOfLinks: number;
  logoUsed: "Yes" | "No" | "Mentioned" | "Unknown";
  tatDays: number | null;
}

export type Status = "removed" | "pending" | "not-reported";

export interface Filters {
  from: Date | null;
  to: Date | null;
  platforms: string[];
  contentTypes: string[];
  statuses: Status[];
}

export interface ProjectWiseRow {
  id: number;
  date: Date | null;
  dateRaw: string;
  platform: string;
  link: string;
  channelId: string;
  followers: number | null;
  category: string;
  views: number | null;
  likes: number | null;
  videoName: string;
  approval: boolean | null;
  reported: boolean | null;
  reportingDate: Date | null;
  removed: boolean | null;
  removalDate: Date | null;
  logoVisible: string;
  account: string;
}

export type CombinedSource = "Project Wise" | "Scrapped Links";

export interface CombinedRow {
  id: string;
  source: CombinedSource;
  date: Date | null;
  dateRaw: string;
  platform: string;
  link: string;
  channelId: string;
  views: number | null;
  reported: boolean | null;
  reportingDate: Date | null;
  removed: boolean | null;
  removalDate: Date | null;
  tatDays: number | null;
  remarks: string;
}

/** The DRM sheet keeps one raw tab per source instead of a combined tracker —
 * mirrors CombinedSource/CombinedRow's role for the ORM "Scanned by Axio" data. */
export type DrmSource = "Telegram" | "YouTube" | "Web-Links";

export interface DrmRow {
  id: string;
  source: DrmSource;
  date: Date | null;
  dateRaw: string;
  /** "Telegram"/"YouTube" for those tabs; the Web-Links tab's own Platform column (e.g. "Scribd") otherwise. */
  platform: string;
  category: string;
  link: string;
  channelName: string;
  subscribers: number | null;
  views: number | null;
  /** Telegram-only: the channel-level "Links Scanned" count. */
  linksScanned: number | null;
  noOfLinks: number;
  reported: boolean | null;
  reportingDate: Date | null;
  removed: boolean | null;
  removalDate: Date | null;
  tatDays: number | null;
  remarks: string;
}

export interface ScrappedLinkRow {
  id: number;
  date: Date | null;
  dateRaw: string;
  platform: string;
  type: string;
  link: string;
  channelId: string;
  noOfLinks: number;
  videoType: string;
  topic: string;
  views: number | null;
  videoName: string;
  subscribers: number | null;
  channelType: string;
  autoApproval: boolean | null;
  approval: boolean | null;
  reported: boolean | null;
  reportingDate: Date | null;
  removed: boolean | null;
  removalDate: Date | null;
  tatDays: number | null;
  remarks: string;
  logoVisible: string;
}
