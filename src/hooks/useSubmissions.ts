import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSubmissionSheet } from "../lib/sheets";
import { normalizeRows } from "../lib/parse";
import type { Submission } from "../lib/types";

const AUTO_REFRESH_MS = 5 * 60 * 1000;

interface State {
  data: Submission[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useSubmissions() {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const inFlight = useRef(false);

  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!opts.silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { rows, fetchedAt } = await fetchSubmissionSheet();
      const data = normalizeRows(rows);
      setState({ data, loading: false, error: null, lastUpdated: fetchedAt });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load sheet data.";
      setState((s) => ({ ...s, loading: false, error: message }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  return { ...state, refresh: () => load() };
}
