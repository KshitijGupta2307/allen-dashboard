import { DrmShell } from "../components/DrmShell";
import { RadarIcon } from "../components/icons";

export function Drm() {
  return (
    <DrmShell title="DRM" subtitle="Anti-piracy takedown tracker">
      <main className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <span
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ background: "color-mix(in srgb, var(--series-2) 14%, transparent)", color: "var(--series-2)" }}
          >
            <RadarIcon size={22} />
          </span>
          <p className="text-[14px] font-medium text-[var(--text-primary)]">DRM report not connected yet</p>
          <p className="text-[13px] text-[var(--text-muted)]">
            This section will show the DRM (Telegram / anti-piracy) takedown data once its sheet is linked up.
          </p>
        </div>
      </main>
    </DrmShell>
  );
}
