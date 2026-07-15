interface DateRangePickerProps {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

function toInputValue(d: Date | null): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromInputValue(v: string): Date | null {
  if (!v) return null;
  const [yyyy, mm, dd] = v.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] text-[var(--text-muted)]">Custom range:</span>
      <input
        type="date"
        value={toInputValue(from)}
        onChange={(e) => onChange(fromInputValue(e.target.value), to)}
        className="text-[12px] border border-[var(--border)] rounded-md px-2 py-1 bg-[var(--surface-1)] hover:border-[var(--border-strong)] transition-colors duration-150"
      />
      <span className="text-[var(--text-muted)]">–</span>
      <input
        type="date"
        value={toInputValue(to)}
        onChange={(e) => onChange(from, fromInputValue(e.target.value))}
        className="text-[12px] border border-[var(--border)] rounded-md px-2 py-1 bg-[var(--surface-1)] hover:border-[var(--border-strong)] transition-colors duration-150"
      />
      {(from || to) && (
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-[12px] text-[var(--series-1)] hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
