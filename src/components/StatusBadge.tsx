import type { Status } from "../lib/types";
import { statusColor } from "../lib/colors";

const STATUS_LABEL: Record<Status, string> = {
  removed: "Removed",
  pending: "Pending",
  "not-reported": "Not reported",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{
        color: statusColor(status),
        background: `color-mix(in srgb, ${statusColor(status)} 14%, transparent)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(status) }} />
      {STATUS_LABEL[status]}
    </span>
  );
}
