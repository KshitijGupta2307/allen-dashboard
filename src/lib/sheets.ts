const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string | undefined;
const SHEET_ID =
  (import.meta.env.VITE_GOOGLE_SHEET_ID as string | undefined) ||
  "1tbrurGWOO4RXdwvuMCgJ3Bt_BTm-Fcn2U-U-Qca4eJ8";
const SUBMISSION_GID = Number(import.meta.env.VITE_SHEET_GID ?? 325209517);
const PROJECT_WISE_GID = Number(import.meta.env.VITE_PROJECT_WISE_GID ?? 756003287);
const SCRAPPED_LINKS_GID = Number(import.meta.env.VITE_SCRAPPED_LINKS_GID ?? 2053982824);

/** DRM lives in a separate spreadsheet from the ORM one above — no hardcoded fallback here,
 * it must come from env so the sheet link/id never lands in source. */
const DRM_SHEET_ID = import.meta.env.VITE_DRM_SHEET_ID as string | undefined;
const DRM_TELEGRAM_GID_RAW = import.meta.env.VITE_DRM_TELEGRAM_GID as string | undefined;
const DRM_YOUTUBE_GID_RAW = import.meta.env.VITE_DRM_YOUTUBE_GID as string | undefined;
const DRM_WEBLINKS_GID_RAW = import.meta.env.VITE_DRM_WEBLINKS_GID as string | undefined;

export class SheetsConfigError extends Error {}
export class SheetsFetchError extends Error {
  status?: number;
}

async function resolveSheetTitle(spreadsheetId: string, gid: number): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}&fields=sheets.properties(sheetId,title)`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = new SheetsFetchError(
      `Could not read spreadsheet metadata (HTTP ${res.status}). Check that the API key is valid and the Sheets API is enabled.`,
    );
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  const sheets: { properties: { sheetId: number; title: string } }[] = json.sheets ?? [];
  const match = sheets.find((s) => s.properties.sheetId === gid);
  if (!match) {
    throw new SheetsFetchError(`No tab with gid=${gid} was found in this spreadsheet.`);
  }
  return match.properties.title;
}

async function fetchValues(spreadsheetId: string, title: string): Promise<string[][]> {
  const range = `'${title.replace(/'/g, "''")}'`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range,
  )}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = new SheetsFetchError(`Could not read sheet values (HTTP ${res.status}).`);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  return (json.values ?? []) as string[][];
}

export interface SheetFetchResult {
  header: string[];
  rows: string[][];
  fetchedAt: Date;
}

async function fetchSheetTabFrom(spreadsheetId: string, gid: number): Promise<SheetFetchResult> {
  if (!API_KEY) {
    throw new SheetsConfigError(
      "Missing VITE_GOOGLE_SHEETS_API_KEY. Add it to a .env.local file (see README) and restart the dev server.",
    );
  }
  const title = await resolveSheetTitle(spreadsheetId, gid);
  const values = await fetchValues(spreadsheetId, title);
  const [header, ...rows] = values;
  return { header: header ?? [], rows, fetchedAt: new Date() };
}

const fetchSheetTab = (gid: number) => fetchSheetTabFrom(SHEET_ID, gid);

export const fetchSubmissionSheet = (): Promise<SheetFetchResult> => fetchSheetTab(SUBMISSION_GID);
export const fetchProjectWiseSheet = (): Promise<SheetFetchResult> => fetchSheetTab(PROJECT_WISE_GID);
export const fetchScrappedLinksSheet = (): Promise<SheetFetchResult> => fetchSheetTab(SCRAPPED_LINKS_GID);

function fetchDrmTab(gidRaw: string | undefined, envVarName: string): Promise<SheetFetchResult> {
  if (!DRM_SHEET_ID || !gidRaw) {
    throw new SheetsConfigError(
      `Missing VITE_DRM_SHEET_ID / ${envVarName}. Add them to a .env.local file (see README) and restart the dev server.`,
    );
  }
  return fetchSheetTabFrom(DRM_SHEET_ID, Number(gidRaw));
}

export const fetchDrmTelegramSheet = (): Promise<SheetFetchResult> => fetchDrmTab(DRM_TELEGRAM_GID_RAW, "VITE_DRM_TELEGRAM_GID");
export const fetchDrmYoutubeSheet = (): Promise<SheetFetchResult> => fetchDrmTab(DRM_YOUTUBE_GID_RAW, "VITE_DRM_YOUTUBE_GID");
export const fetchDrmWebLinksSheet = (): Promise<SheetFetchResult> => fetchDrmTab(DRM_WEBLINKS_GID_RAW, "VITE_DRM_WEBLINKS_GID");
