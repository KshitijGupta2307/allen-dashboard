import type { Filters, Status } from "../lib/types";
import { MultiSelect } from "./MultiSelect";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "./Button";

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
        <Button active={isPresetActive(null)} onClick={() => applyPreset(null)}>
          All time
        </Button>
        <Button active={isPresetActive(30)} onClick={() => applyPreset(30)}>
          30d
        </Button>
        <Button active={isPresetActive(90)} onClick={() => applyPreset(90)}>
          90d
        </Button>
        <Button active={isPresetActive(182)} onClick={() => applyPreset(182)}>
          6m
        </Button>
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
          <Button key={s.value} pill active={filters.statuses.includes(s.value)} onClick={() => toggleStatus(s.value)}>
            {s.label}
          </Button>
        ))}
      </div>

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
