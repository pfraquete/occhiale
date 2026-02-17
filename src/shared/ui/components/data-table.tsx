"use client";

import {
  flexRender,
  type ColumnDef,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { cn } from "@/shared/lib/utils/cn";

/* ───────── Table wrapper ───────── */
interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  className?: string;
  emptyMessage?: string;
}

export function DataTable<TData>({
  table,
  columns,
  className,
  emptyMessage = "Nenhum registro encontrado.",
}: DataTableProps<TData>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border",
        className
      )}
    >
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-border bg-bg-secondary"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary"
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                  }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-text-primary"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-bg-secondary/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-text-primary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-tertiary"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── Pagination ───────── */
interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
  totalCount?: number;
}

export function DataTablePagination<TData>({
  table,
  totalCount,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-text-tertiary">
        {totalCount !== undefined
          ? `${totalCount} registro${totalCount !== 1 ? "s" : ""}`
          : `Página ${pageIndex + 1} de ${pageCount}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-secondary disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-text-secondary">
          {pageIndex + 1} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-secondary disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
