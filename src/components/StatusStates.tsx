export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--text-muted)]">
      <span className="w-6 h-6 border-2 border-[var(--border-strong)] border-t-[var(--series-1)] rounded-full animate-spin" />
      <p className="text-[13px]">Loading submission data…</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center max-w-lg mx-auto">
      <span className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: "color-mix(in srgb, var(--status-critical) 14%, transparent)", color: "var(--status-critical)" }}>
        !
      </span>
      <p className="text-[14px] font-medium">Could not load the dashboard</p>
      <p className="text-[13px] text-[var(--text-muted)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-[12px] font-medium border border-[var(--border)] rounded-md px-3 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] mt-1"
      >
        Try again
      </button>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-[var(--text-muted)]">
      <p className="text-[14px] font-medium text-[var(--text-primary)]">No records match these filters</p>
      <p className="text-[13px]">Try widening the date range or clearing a filter.</p>
    </div>
  );
}
