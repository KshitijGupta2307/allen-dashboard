import { ChevronDownIcon } from "./icons";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

export function Select({ value, options, onChange, ariaLabel }: SelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-[12px] font-medium border border-[var(--border)] rounded-md pl-3 pr-7 py-1.5 bg-[var(--surface-1)] hover:border-[var(--border-strong)] transition-colors duration-150 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={14} className="pointer-events-none absolute right-2 text-[var(--text-muted)]" />
    </div>
  );
}
