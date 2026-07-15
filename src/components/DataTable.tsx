import type { ColumnDef } from "@tanstack/react-table";
import type { Submission } from "../lib/types";
import { statusOf } from "../lib/aggregate";
import { formatCompact, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { RecordTable } from "./RecordTable";

const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => formatDate(info.getValue<Date | null>()),
    sortingFn: "datetime",
  },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "contentType", header: "Type" },
  {
    accessorKey: "link",
    header: "Link",
    cell: (info) => {
      const v = info.getValue<string>();
      if (!v) return <span className="text-[var(--text-muted)]">—</span>;
      const isUrl = /^https?:\/\//i.test(v);
      return (
        <span className="block max-w-[260px] truncate" title={v}>
          {isUrl ? (
            <a href={v} target="_blank" rel="noreferrer" className="text-[var(--series-1)] hover:underline">
              {v}
            </a>
          ) : (
            v
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "channelId",
    header: "Channel / account",
    cell: (info) => info.getValue<string>() || <span className="text-[var(--text-muted)]">—</span>,
  },
  {
    id: "status",
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue<ReturnType<typeof statusOf>>()} />,
    accessorFn: (row) => statusOf(row),
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: (info) => {
      const v = info.getValue<number | null>();
      return v === null ? <span className="text-[var(--text-muted)]">—</span> : formatCompact(v);
    },
  },
  {
    accessorKey: "tatDays",
    header: "TAT (d)",
    cell: (info) => info.getValue<number | null>() ?? <span className="text-[var(--text-muted)]">—</span>,
  },
];

export function DataTable({ data }: { data: Submission[] }) {
  return (
    <RecordTable
      data={data}
      columns={columns}
      title="Submission log"
      initialSorting={[{ id: "date", desc: true }]}
    />
  );
}
