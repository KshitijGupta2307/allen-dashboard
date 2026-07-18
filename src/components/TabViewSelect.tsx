import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

export interface TabViewOption<T extends string> {
  value: T;
  label: string;
}

interface TabViewSelectProps<T extends string> {
  label: string;
  options: TabViewOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function TabViewSelect<T extends string>({ label, options, value, onChange }: TabViewSelectProps<T>) {
  const [open, setOpen] = useState(false);
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

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="text-[12px] border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 flex items-center gap-1.5 min-w-[160px] justify-between"
      >
        <span className="text-[var(--text-muted)]">{label}:</span>
        <span className="text-[var(--text-primary)] font-medium truncate">{current?.label}</span>
        <ChevronDownIcon
          size={14}
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1.5 min-w-[160px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5"
          style={{ boxShadow: "var(--shadow-card-hover)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] transition-colors duration-100 ${
                opt.value === value
                  ? "bg-[var(--series-1)] text-white font-medium"
                  : "hover:bg-[var(--page)] text-[var(--text-primary)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
