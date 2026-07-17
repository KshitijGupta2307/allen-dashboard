import { useState, type ReactNode } from "react";
import type { Route } from "../lib/routes";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  title: string;
  subtitle: string;
  route: Route;
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  children: ReactNode;
}

export function AppShell({ title, subtitle, route, lastUpdated, loading, onRefresh, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-full flex">
      <Sidebar route={route} mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          subtitle={subtitle}
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={onRefresh}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        {children}
      </div>
    </div>
  );
}
