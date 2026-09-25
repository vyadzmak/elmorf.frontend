"use client";

import { Button } from "@elmorf/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@elmorf/ui/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@elmorf/ui/lib/utils";

export interface ModelColumn<T> {
  id: string;
  header: string;
  width: string;
  cell: (row: T) => ReactNode;
  sortValue: (row: T) => string | number;
}

export function ModelTable<T extends { id: string }>({
  rows,
  columns,
  selectedId,
  emptyLabel,
  countLabel,
  lockColumnId,
  onSelect,
}: {
  rows: T[];
  columns: ModelColumn<T>[];
  selectedId: string | null;
  emptyLabel: string;
  countLabel: string;
  lockColumnId: string;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Morphology");
  const parentRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: lockColumnId, desc: false }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        accessorFn: (row) => column.sortValue(row),
        header: column.header,
        cell: ({ row }) => column.cell(row.original),
        enableHiding: column.id !== lockColumnId,
      })),
    [columns, lockColumnId],
  );
  // TanStack Table returns functions that React cannot memoize. Rows stay in this component.
  // eslint-disable-next-line react-hooks/incompatible-library -- table state is local to this view
  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });
  const visible = table.getVisibleLeafColumns();
  const template = visible
    .map((column) => columns.find((item) => item.id === column.id)?.width ?? "120px")
    .join(" ");
  const tableRows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 8,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-2">
        <p className="text-xs text-muted-foreground">{countLabel}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              {t("columns")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllLeafColumns().map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                disabled={!column.getCanHide()}
                onCheckedChange={(checked) => {
                  column.toggleVisibility(checked === true);
                }}
              >
                {columns.find((item) => item.id === column.id)?.header ?? column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {tableRows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
          <div
            className="sticky top-0 z-10 grid min-w-[720px] items-center gap-3 border-b border-border bg-background px-3"
            style={{ gridTemplateColumns: template }}
          >
            {visible.map((column) => {
              const sorted = column.getIsSorted();
              return (
                <button
                  key={column.id}
                  type="button"
                  className="h-9 truncate text-start text-xs font-medium text-muted-foreground"
                  onClick={() => {
                    column.toggleSorting(sorted === "asc");
                  }}
                >
                  {columns.find((item) => item.id === column.id)?.header}
                  {sorted === "asc" ? " ↑" : null}
                  {sorted === "desc" ? " ↓" : null}
                </button>
              );
            })}
          </div>
          <div className="relative min-w-[720px]" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = tableRows[item.index];
              if (!row) {
                return null;
              }

              return (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={row.id === selectedId}
                  className={cn(
                    "absolute start-0 grid w-full items-center gap-3 border-b border-border px-3 text-start text-sm",
                    row.id === selectedId ? "bg-accent" : "hover:bg-muted",
                  )}
                  style={{
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                    gridTemplateColumns: template,
                  }}
                  onClick={() => {
                    onSelect(row.id);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <span key={cell.id} className="truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
