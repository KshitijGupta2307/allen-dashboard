import { useEffect } from "react";
import { modeOf, type Route } from "../lib/routes";
import { CloseIcon, GaugeIcon, RadarIcon, ReportIcon } from "./icons";

interface SidebarProps {
  route: Route;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

type NavItem = { route: Route; label: string; href: string; icon: typeof GaugeIcon };

const ORM_NAV_ITEMS: NavItem[] = [
  { route: "dashboard", label: "Allen Submission", href: "#/", icon: GaugeIcon },
  { route: "scanned-by-axio", label: "Scanned by Axio", href: "#/scanned-by-axio", icon: RadarIcon },
  { route: "overall-report", label: "Overall Report", href: "#/overall-report", icon: ReportIcon },
];

const DRM_NAV_ITEMS: NavItem[] = [
  { route: "drm", label: "Axio Scanned", href: "#/drm", icon: RadarIcon },
  { route: "drm-report", label: "Report", href: "#/drm-report", icon: ReportIcon },
];

function NavList({ route, onNavigate }: { route: Route; onNavigate: () => void }) {
  const items = modeOf(route) === "drm" ? DRM_NAV_ITEMS : ORM_NAV_ITEMS;
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.route === route;
        return (
          <a
            key={item.route}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
              active
                ? "text-[var(--series-1)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--page)] hover:text-[var(--text-primary)]"
            }`}
            style={active ? { background: "color-mix(in srgb, var(--series-1) 10%, transparent)" } : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <img src="/axio-logo.png" alt="Axio Principle" className="w-8 h-8 rounded-md object-contain shrink-0" />
      <span className="text-[14px] font-semibold leading-tight">Axio Principle</span>
    </div>
  );
}

export function Sidebar({ route, mobileOpen, onMobileClose }: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Persistent desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--surface-1)]">
        <Brand />
        <NavList route={route} onNavigate={() => {}} />
      </aside>

      {/* Mobile / tablet drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={onMobileClose} aria-hidden="true" />
          <aside
            className="relative flex flex-col w-64 h-full bg-[var(--surface-1)]"
            style={{ boxShadow: "var(--shadow-card-hover)" }}
          >
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--page)] transition-colors duration-150 shrink-0"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <NavList route={route} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
