import { useEffect, useRef, useState } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { ChevronDownIcon } from "./icons";

type PresetKey = "7d" | "this-month" | "last-month" | "3m" | "all" | "custom";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "Last 7 Days" },
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "3m", label: "Last 3 Months" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom Range" },
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Presets are anchored to the real current date, not the latest date found in the data —
 * a stray future-dated row shouldn't be able to hijack what "this month" means. */
function rangeFor(key: PresetKey): [Date | null, Date | null] {
  const today = startOfDay(new Date());
  switch (key) {
    case "7d":
      return [addDays(today, -6), today];
    case "this-month":
      return [startOfMonth(today), today];
    case "last-month": {
      const lastMonth = addMonths(today, -1);
      return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
    }
    case "3m":
      return [addMonths(today, -3), today];
    default:
      return [null, null];
  }
}

function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a.getTime() - b.getTime()) < 86400000;
}

function matchesPreset(key: PresetKey, from: Date | null, to: Date | null): boolean {
  if (key === "custom") return false;
  if (key === "all") return !from && !to;
  const [f, t] = rangeFor(key);
  return sameDay(from, f) && sameDay(to, t);
}

interface TimelineDateFilterProps {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

/** Single "Timeline" dropdown: Last 7 Days / This Month / Last Month / Last 3 Months /
 * All Time / Custom Range, with the Custom From/Till inputs collapsed away until picked. */
export function TimelineDateFilter({ from, to, onChange }: TimelineDateFilterProps) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const activeKey: PresetKey = customOpen
    ? "custom"
    : (PRESETS.find((p) => matchesPreset(p.key, from, to))?.key ?? (from || to ? "custom" : "all"));
  const currentLabel = PRESETS.find((p) => p.key === activeKey)?.label ?? "All Time";
  const showDatePicker = customOpen || activeKey === "custom";

  const handleSelect = (key: PresetKey) => {
    if (key === "custom") {
      setCustomOpen(true);
      setOpen(false);
      return;
    }
    setCustomOpen(false);
    onChange(...rangeFor(key));
    setOpen(false);
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="text-[12px] border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 flex items-center gap-1.5 min-w-[150px] justify-between"
        >
          <span className="text-[var(--text-muted)]">Timeline:</span>
          <span className="text-[var(--text-primary)] font-medium truncate">{currentLabel}</span>
          <ChevronDownIcon
            size={14}
            className={`text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute z-20 mt-1.5 min-w-[170px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5"
            style={{ boxShadow: "var(--shadow-card-hover)" }}
          >
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleSelect(p.key)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] transition-colors duration-100 ${
                  activeKey === p.key
                    ? "bg-[var(--series-1)] text-white font-medium"
                    : "hover:bg-[var(--page)] text-[var(--text-primary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

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
