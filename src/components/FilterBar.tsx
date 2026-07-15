import type { Filters, Status } from "../lib/types";
import { MultiSelect } from "./MultiSelect";
import { DateRangePicker } from "./DateRangePicker";

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  platforms: string[];
  contentTypes: string[];
  maxDate: Date | null;
  resultCount: number;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "removed", label: "Removed" },
  { value: "pending", label: "Pending" },
  { value: "not-reported", label: "Not reported" },
];

function daysAgo(from: Date, n: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

export function FilterBar({ filters, onChange, platforms, contentTypes, maxDate, resultCount }: FilterBarProps) {
  const applyPreset = (n: number | null) => {
    if (!maxDate || n === null) {
      onChange({ ...filters, from: null, to: null });
      return;
    }
    onChange({ ...filters, from: daysAgo(maxDate, n), to: maxDate });
  };

  const isPresetActive = (n: number | null) => {
    if (n === null) return !filters.from && !filters.to;
    if (!maxDate || !filters.from || !filters.to) return false;
    const expectedFrom = daysAgo(maxDate, n);
    return (
      Math.abs(filters.from.getTime() - expectedFrom.getTime()) < 86400000 &&
      Math.abs(filters.to.getTime() - maxDate.getTime()) < 86400000
    );
  };

  const presetBtn = (label: string, n: number | null) => (
    <button
      type="button"
      onClick={() => applyPreset(n)}
      className={`text-[12px] rounded-md px-2.5 py-1.5 border transition-colors duration-150 ${
        isPresetActive(n)
          ? "border-[var(--series-1)] bg-[var(--series-1)] text-white"
          : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)]"
      }`}
    >
      {label}
    </button>
  );

  const toggleStatus = (s: Status) => {
    if (filters.statuses.includes(s)) onChange({ ...filters, statuses: filters.statuses.filter((x) => x !== s) });
    else onChange({ ...filters, statuses: [...filters.statuses, s] });
  };

  const hasActiveFilters =
    filters.from || filters.to || filters.platforms.length || filters.contentTypes.length || filters.statuses.length;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-1.5">
        {presetBtn("All time", null)}
        {presetBtn("30d", 30)}
        {presetBtn("90d", 90)}
        {presetBtn("6m", 182)}
      </div>

      <div className="w-px h-5 bg-[var(--border)] mx-1" />

      <DateRangePicker from={filters.from} to={filters.to} onChange={(from, to) => onChange({ ...filters, from, to })} />

      <div className="w-px h-5 bg-[var(--border)] mx-1" />

      <MultiSelect
        label="Platform"
        options={platforms}
        selected={filters.platforms}
        onChange={(v) => onChange({ ...filters, platforms: v })}
      />
      <MultiSelect
        label="Type"
        options={contentTypes}
        selected={filters.contentTypes}
        onChange={(v) => onChange({ ...filters, contentTypes: v })}
      />

      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => toggleStatus(s.value)}
            className={`text-[12px] rounded-full px-2.5 py-1 border transition-colors duration-150 ${
              filters.statuses.includes(s.value)
                ? "border-[var(--series-1)] bg-[var(--series-1)] text-white"
                : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <span className="text-[12px] text-[var(--text-muted)] ml-auto tabular">{resultCount.toLocaleString()} records</span>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ from: null, to: null, platforms: [], contentTypes: [], statuses: [] })}
          className="text-[12px] text-[var(--series-1)] hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}
