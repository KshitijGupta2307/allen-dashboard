import type { Filters, Status } from "../lib/types";
import { MultiSelect } from "./MultiSelect";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "./Button";
import { TimelineSelect, type TimelineOption } from "./TimelineSelect";
import { StatusSelect } from "./StatusSelect";

const TIMELINE_OPTIONS: TimelineOption[] = [
  { value: null, label: "All time" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: 182, label: "6m" },
];

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

  const hasActiveFilters =
    filters.from || filters.to || filters.platforms.length || filters.contentTypes.length || filters.statuses.length;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <TimelineSelect options={TIMELINE_OPTIONS} isActive={isPresetActive} onSelect={applyPreset} />

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

      <StatusSelect
        options={STATUS_OPTIONS}
        selected={filters.statuses}
        onChange={(v) => onChange({ ...filters, statuses: v })}
      />

      <span className="text-[12px] text-[var(--text-muted)] ml-auto tabular">{resultCount.toLocaleString()} records</span>

      {hasActiveFilters && (
        <Button
          variant="link"
          onClick={() => onChange({ from: null, to: null, platforms: [], contentTypes: [], statuses: [] })}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
