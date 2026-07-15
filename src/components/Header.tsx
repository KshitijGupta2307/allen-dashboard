import { useState } from "react";
import type { Route } from "../lib/routes";

interface HeaderProps {
  title: string;
  subtitle: string;
  route: Route;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

const NAV_ITEMS: { route: Route; label: string; href: string }[] = [
  { route: "dashboard", label: "Takedown Ops", href: "#/" },
  { route: "scanned-by-axio", label: "Scanned by Axio", href: "#/scanned-by-axio" },
];

export function Header({ title, subtitle, route, lastUpdated, loading, onRefresh }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className="flex flex-col justify-center items-center gap-[3px] w-8 h-8 rounded-md border border-[var(--border)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 shrink-0"
        >
          <span className="block w-4 h-[1.5px] bg-[var(--text-primary)]" />
          <span className="block w-4 h-[1.5px] bg-[var(--text-primary)]" />
          <span className="block w-4 h-[1.5px] bg-[var(--text-primary)]" />
        </button>
        <img src="/axio-logo.png" alt="Axio Principle" className="w-9 h-9 rounded-md object-contain shrink-0" />
        <div>
          <h1 className="text-[18px] font-semibold leading-tight">{title}</h1>
          <p className="text-[12px] text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-[var(--text-muted)] tabular">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
            : "—"}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-[12px] font-medium border border-[var(--border)] rounded-md px-3 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span className={loading ? "animate-spin" : ""}>⟳</span>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <nav className="absolute left-6 top-full mt-1.5 z-50 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] py-1.5 flex flex-col" style={{ boxShadow: "var(--shadow-card-hover)" }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.route}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-[13px] hover:bg-[var(--page)] transition-colors duration-150 ${
                  item.route === route ? "font-semibold text-[var(--series-1)]" : "text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
