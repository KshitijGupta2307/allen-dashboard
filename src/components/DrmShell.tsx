import type { ReactNode } from "react";
import { ModeMenu } from "./ModeMenu";

interface DrmShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Standalone layout for the DRM dashboard — deliberately not the ORM AppShell/Sidebar,
 * since DRM is a separate data domain (its own sheet) with no relation to the Allen
 * Submission / Scanned by Axio / Overall Report nav. */
export function DrmShell({ title, subtitle, children }: DrmShellProps) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/axio-logo.png" alt="Axio Principle" className="w-8 h-8 rounded-md object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold leading-tight truncate">{title}</h1>
            <p className="text-[12px] text-[var(--text-muted)] truncate">{subtitle}</p>
          </div>
        </div>
        <ModeMenu route="drm" />
      </header>
      {children}
    </div>
  );
}
