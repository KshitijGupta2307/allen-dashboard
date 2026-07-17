import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
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

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((o) => o !== opt));
    else onChange([...selected, opt]);
  };

  const summary = selected.length === 0 ? "All" : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="text-[12px] border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 flex items-center gap-1.5 min-w-[120px] justify-between"
      >
        <span className="text-[var(--text-muted)]">{label}:</span>
        <span className="text-[var(--text-primary)] font-medium truncate max-w-[100px]">{summary}</span>
        <ChevronDownIcon
          size={14}
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1.5 min-w-[200px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5"
          style={{ boxShadow: "var(--shadow-card-hover)" }}
        >
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 px-2 py-1"
            >
              Clear selection
            </button>
          )}
          <div className="max-h-56 overflow-auto thin-scroll">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--page)] transition-colors duration-100 cursor-pointer text-[12px]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="accent-[var(--series-1)]"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
