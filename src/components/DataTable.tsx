import type { ColumnDef } from "@tanstack/react-table";
import type { Submission } from "../lib/types";
import { statusOf } from "../lib/aggregate";
import { formatCompact, formatDate } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { RecordTable } from "./RecordTable";
import { LinkCell } from "./LinkCell";

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
    cell: (info) => <LinkCell value={info.getValue<string>()} />,
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
    meta: { align: "right" },
    cell: (info) => {
      const v = info.getValue<number | null>();
      return v === null ? <span className="text-[var(--text-muted)]">—</span> : formatCompact(v);
    },
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
