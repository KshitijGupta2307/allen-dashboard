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
  return (
    <div className="inline-flex items-center gap-2.5" role="group" aria-label={label}>
      <span className="text-[12px] font-medium text-[var(--text-muted)]">{label}</span>
      <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--page)] p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`text-[12px] font-medium rounded-full px-3 py-1.5 transition-all duration-150 whitespace-nowrap ${
                active
                  ? "bg-[var(--surface-1)] text-[var(--series-1)] shadow-[var(--shadow-card)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
