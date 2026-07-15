import { useCallback, useEffect, useRef, useState } from "react";
import type { SheetFetchResult } from "../lib/sheets";

const AUTO_REFRESH_MS = 5 * 60 * 1000;

interface State<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/** Same load/refresh/auto-refresh shape as useSubmissions, generalized over any sheet tab. */
export function useSheetTab<T>(fetchFn: () => Promise<SheetFetchResult>, normalize: (rows: string[][]) => T[]) {
  const [state, setState] = useState<State<T>>({
    data: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const inFlight = useRef(false);

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (!opts.silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const { rows, fetchedAt } = await fetchFn();
        const data = normalize(rows);
        setState({ data, loading: false, error: null, lastUpdated: fetchedAt });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load sheet data.";
        setState((s) => ({ ...s, loading: false, error: message }));
      } finally {
        inFlight.current = false;
      }
    },
    [fetchFn, normalize],
  );

  useEffect(() => {
    load();
    const interval = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  return { ...state, refresh: () => load() };
}
