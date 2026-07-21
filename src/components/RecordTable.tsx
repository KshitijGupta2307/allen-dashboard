import { useEffect, useState, type UIEvent } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Right-aligns header + cells — use for numeric columns (Views, TAT, counts). */
    align?: "right";
  }
}

interface RecordTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  initialSorting?: SortingState;
  emptyMessage?: string;
}

const CHUNK_SIZE = 25;
const SCROLL_THRESHOLD_PX = 120;

export function RecordTable<T>({
  data,
  columns,
  title,
  initialSorting = [],
  emptyMessage = "No records match the current filters.",
}: RecordTableProps<T>) {
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  const table = useReactTable({
    data,
    columns,
    state: { sorting: initialSorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  // Data reference changes whenever filters/sheet refresh change the result set — restart from the top.
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [data]);

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore) return;
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX) {
      setVisibleCount((v) => Math.min(v + CHUNK_SIZE, rows.length));
    }
  };

  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] flex flex-col"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[13px] font-semibold">{title}</h3>
        <span className="text-[12px] text-[var(--text-muted)] tabular">
          {rows.length
            ? `Showing ${visibleRows.length.toLocaleString()} of ${rows.length.toLocaleString()}`
            : "0 records"}
        </span>
      </div>
      <div className="thin-scroll overflow-auto max-h-[560px]" onScroll={handleScroll}>
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 z-10 bg-[var(--page)]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={`font-semibold uppercase tracking-wide text-[10px] text-[var(--text-muted)] border-b border-[var(--border)] px-3 py-2.5 whitespace-nowrap ${
                      h.column.columnDef.meta?.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--page)] transition-colors duration-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-3 py-2.5 tabular whitespace-nowrap ${
                      cell.column.columnDef.meta?.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-[var(--text-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {hasMore && (
          <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-[var(--text-muted)]">
            <span className="w-3 h-3 border-2 border-[var(--border-strong)] border-t-[var(--series-1)] rounded-full animate-spin" />
            Loading more…
          </div>
        )}
      </div>
    </div>
  );
}
