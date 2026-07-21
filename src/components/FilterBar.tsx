import type { Filters, Status } from "../lib/types";
import { MultiSelect } from "./MultiSelect";
import { Button } from "./Button";
import { TimelineDateFilter } from "./TimelineDateFilter";
import { StatusSelect } from "./StatusSelect";

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  platforms: string[];
  contentTypes: string[];
  resultCount: number;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "removed", label: "Removed" },
  { value: "pending", label: "Pending" },
  { value: "not-reported", label: "Not reported" },
];

export function FilterBar({ filters, onChange, platforms, contentTypes, resultCount }: FilterBarProps) {
  const hasActiveFilters =
    filters.from || filters.to || filters.platforms.length || filters.contentTypes.length || filters.statuses.length;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <TimelineDateFilter
        from={filters.from}
        to={filters.to}
        onChange={(from, to) => onChange({ ...filters, from, to })}
      />

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
