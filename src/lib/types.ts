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
