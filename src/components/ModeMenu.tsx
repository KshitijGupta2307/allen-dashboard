import { useEffect, useRef, useState } from "react";
import { modeOf, type Route, type Mode } from "../lib/routes";
import { ChevronDownIcon } from "./icons";

const MODE_LABEL: Record<Mode, string> = { orm: "ORM", drm: "DRM" };
const MODE_HREF: Record<Mode, string> = { orm: "#/", drm: "#/drm" };

export function ModeMenu({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mode = modeOf(route);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="text-[12px] font-medium border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--page)] hover:border-[var(--border-strong)] transition-colors duration-150 flex items-center gap-1.5"
      >
        <span className="text-[var(--text-primary)]">{MODE_LABEL[mode]}</span>
        <ChevronDownIcon
          size={14}
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-1.5 min-w-[120px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5"
          style={{ boxShadow: "var(--shadow-card-hover)" }}
        >
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <a
              key={m}
              href={MODE_HREF[m]}
              onClick={() => setOpen(false)}
              className={`block w-full text-left px-2 py-1.5 rounded-md text-[12px] transition-colors duration-100 ${
                m === mode ? "bg-[var(--series-1)] text-white font-medium" : "hover:bg-[var(--page)] text-[var(--text-primary)]"
              }`}
            >
              {MODE_LABEL[m]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
