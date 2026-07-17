import { Button } from "./Button";
import { MenuIcon, RefreshIcon } from "./icons";

interface TopBarProps {
  title: string;
  subtitle: string;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenMobileNav: () => void;
}

export function TopBar({ title, subtitle, lastUpdated, loading, onRefresh, onOpenMobileNav }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 shrink-0"
        >
          <MenuIcon size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold leading-tight truncate">{title}</h1>
          <p className="text-[12px] text-[var(--text-muted)] truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline text-[12px] text-[var(--text-muted)] tabular">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
            : "—"}
        </span>
        <Button onClick={onRefresh} disabled={loading}>
          <RefreshIcon size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{loading ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </div>
    </header>
  );
}
