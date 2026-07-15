# Takedown Ops — Brand Protection Dashboard

A live dashboard over the **Submission** tab of the [tracking sheet](https://docs.google.com/spreadsheets/d/1YqWI2-8jsBaYPSmQp_ewxH2RwYDJHnC_S5lygLOuLe4/edit): trend of flagged content, platform/content-type breakdowns, takedown funnel, turnaround time, top offending accounts, and a searchable/sortable record log. Built with React + Vite + TypeScript + Recharts, pulling data straight from the Google Sheets API on every page load (auto-refreshes every 5 minutes; there's also a manual Refresh button).

## 1. Create a Google Sheets API key

The dashboard reads the sheet directly from the browser, so it needs a Google Cloud API key. This is a one-time, ~5 minute setup:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick an existing one).
2. **APIs & Services → Library** → search **"Google Sheets API"** → **Enable**.
3. **APIs & Services → Credentials** → **Create credentials → API key**. Copy the key.
4. Click **Restrict key** on the new key (recommended, not required to run locally):
   - **API restrictions** → restrict to **Google Sheets API**.
   - **Application restrictions** → **Websites** → add the domain(s) you'll host the dashboard on (e.g. `localhost` for dev, your production domain).
5. Make sure the sheet itself is shared as **"Anyone with the link → Viewer"** (Share button, top right of the sheet) — the API key alone can't read a private sheet.

## 2. Configure the app

```
cp .env.example .env.local
```

Edit `.env.local` and paste your key:

```
VITE_GOOGLE_SHEETS_API_KEY=your-key-here
```

`VITE_GOOGLE_SHEET_ID` and `VITE_SHEET_GID` are already pre-filled for the Submission tab of this sheet — only change them if you point the dashboard at a different spreadsheet/tab. `VITE_PROJECT_WISE_GID` and `VITE_SCRAPPED_LINKS_GID` are likewise pre-filled for the sheet's "Project Wise" and "Scrapped Links" tabs, used by the second page below.

## Pages

Use the hamburger menu (top-left, next to the logo) to switch pages:

- **Takedown Ops** (`#/`) — the Submission-tab dashboard described above.
- **Scanned by Axio** (`#/scanned-by-axio`) — record logs from the "Project Wise" and "Scrapped Links" tabs, with a tab switch, free-text search, and the same reported/removed KPIs.

Routing is hash-based (`#/...`), so it works on any static host with no server rewrite rules needed.

## 3. Run it

```
npm install
npm run dev
```

Open the printed local URL. If the key or sharing isn't set up yet, the dashboard shows a clear error state instead of a blank screen — the message tells you exactly what to fix.

## Notes on the data

- The Submission tab has two columns both literally titled "Type" (content category vs. account persona) — the app reads them by fixed column position, so don't reorder/insert columns in that tab without updating `COL` in `src/lib/parse.ts`.
- `Views`/`Likes`/`Tat` are free-text (e.g. `"4.8M"`, `"2.5 M"`, `"0.0."`) and are parsed best-effort; unparseable cells are treated as missing rather than zero.
- Rows with no Date, Link, or Channel are treated as blank template rows and excluded.

## Build

```
npm run build
```

Outputs a static site in `dist/` — deploy it anywhere (Vercel, Netlify, S3, etc.). Remember to set the same env vars in your host's build settings, and add your production domain to the API key's website restrictions.
