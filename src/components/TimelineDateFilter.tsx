import { useState } from "react";
import { TimelineSelect, type TimelineOption } from "./TimelineSelect";
import { DateRangePicker } from "./DateRangePicker";

const TIMELINE_OPTIONS: TimelineOption[] = [
  { value: null, label: "All time" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
  { value: 182, label: "6m" },
  { value: "custom", label: "Custom" },
];

const DATE_PRESETS = TIMELINE_OPTIONS.filter(
  (o): o is TimelineOption & { value: number | null } => o.value !== "custom",
);

function daysAgo(from: Date, n: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

interface TimelineDateFilterProps {
  from: Date | null;
  to: Date | null;
  maxDate: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

/** Timeline preset dropdown (All time/30d/90d/6m/Custom) with the custom From/Till
 * range collapsed away until "Custom" is picked or a non-preset range is already active. */
export function TimelineDateFilter({ from, to, maxDate, onChange }: TimelineDateFilterProps) {
  const [customOpen, setCustomOpen] = useState(false);

  const applyPreset = (n: number | null) => {
    if (!maxDate || n === null) {
      onChange(null, null);
      return;
    }
    onChange(daysAgo(maxDate, n), maxDate);
  };

  const isDatePresetActive = (n: number | null) => {
    if (n === null) return !from && !to;
    if (!maxDate || !from || !to) return false;
    const expectedFrom = daysAgo(maxDate, n);
    return (
      Math.abs(from.getTime() - expectedFrom.getTime()) < 86400000 && Math.abs(to.getTime() - maxDate.getTime()) < 86400000
    );
  };

  const isCustomActive = !!(from || to) && !DATE_PRESETS.some((o) => isDatePresetActive(o.value));

  const isTimelineActive = (v: number | null | "custom") => (v === "custom" ? isCustomActive : isDatePresetActive(v));

  const handleTimelineSelect = (v: number | null | "custom") => {
    if (v === "custom") {
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    applyPreset(v);
  };

  const showDatePicker = customOpen || isCustomActive;

  return (
    <>
      <TimelineSelect options={TIMELINE_OPTIONS} isActive={isTimelineActive} onSelect={handleTimelineSelect} />

      {showDatePicker && (
        <>
          <div className="w-px h-5 bg-[var(--border)] mx-1" />
          <DateRangePicker
            from={from}
            to={to}
            onChange={(f, t) => {
              onChange(f, t);
              if (!f && !t) setCustomOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}
