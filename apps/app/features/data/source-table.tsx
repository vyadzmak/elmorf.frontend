"use client";

import type { Source } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@elmorf/ui/components/ui/dropdown-menu";
import { cn } from "@elmorf/ui/lib/utils";
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
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { sourceUpdatedAt } from "@/features/data/search-params";
import {
  SourceStatusText,
  sourceKindLabel,
  sourceStageLabel,
  useSourceFormat,
} from "@/features/data/source-status";

const columnKey = "elmorf.data-columns";
let columnSnapshot = "";
const columnListeners = new Set<() => void>();

function subscribeColumns(listener: () => void) {
  columnListeners.add(listener);
  return () => {
    columnListeners.delete(listener);
  };
}

function columnServerSnapshot() {
  return "";
}

function columnClientSnapshot() {
  const next = window.localStorage.getItem(columnKey) ?? "";
  if (next === columnSnapshot) {
    return columnSnapshot;
  }

  columnSnapshot = next;
  return columnSnapshot;
}

function writeColumnVisibility(value: VisibilityState) {
  const next = JSON.stringify(value);
  window.localStorage.setItem(columnKey, next);
  columnSnapshot = next;
  for (const listener of columnListeners) {
    listener();
  }
}

function readColumnVisibility(raw: string): VisibilityState {
  if (!raw) {
    return { stage: false };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { stage: false };
    }

    return parsed as VisibilityState;
  } catch {
    return { stage: false };
  }
}

export function SourceTable({
  rows,
  selectedId,
  emptyLabel,
  countLabel,
  onSelect,
}: {
  rows: Source[];
  selectedId: string | null;
  emptyLabel: string;
  countLabel: string;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Data");
  const format = useSourceFormat();
  const parentRef = useRef<HTMLDivElement>(null);
  const stored = useSyncExternalStore(subscribeColumns, columnClientSnapshot, columnServerSnapshot);
  const columnVisibility = readColumnVisibility(stored);
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const columns = useMemo<ColumnDef<Source>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        header: t("columnName"),
        cell: ({ row }) => row.original.name,
        enableHiding: false,
      },
      {
        id: "type",
        accessorFn: (row) => row.kind,
        header: t("columnType"),
        cell: ({ row }) => sourceKindLabel(row.original.kind, t),
      },
      {
        id: "status",
        accessorFn: (row) => row.processing.status,
        header: t("columnStatus"),
        cell: ({ row }) => <SourceStatusText processing={row.original.processing} />,
      },
      {
        id: "size",
        accessorFn: (row) => row.sizeBytes,
        header: t("columnSize"),
        cell: ({ row }) => format.bytes(row.original.sizeBytes),
      },
      {
        id: "updated",
        accessorFn: (row) => sourceUpdatedAt(row),
        header: t("columnUpdated"),
        cell: ({ row }) => format.date(sourceUpdatedAt(row.original)),
      },
      {
        id: "stage",
        accessorFn: (row) => (row.processing.status === "processing" ? row.processing.stage : ""),
        header: t("columnStage"),
        cell: ({ row }) => sourceStageLabel(row.original, t),
      },
    ],
    [format, t],
  );
  // TanStack Table returns functions that React cannot memoize. Rows stay in this component.
  // eslint-disable-next-line react-hooks/incompatible-library -- table state is local to this view
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnVisibility) : updater;
      writeColumnVisibility(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });
  const widths: Record<string, string> = {
    name: "minmax(180px, 1.6fr)",
    type: "96px",
    status: "180px",
    size: "96px",
    updated: "180px",
    stage: "140px",
  };
  const visible = table.getVisibleLeafColumns();
  const template = visible.map((column) => widths[column.id] ?? "120px").join(" ");
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
                {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
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
            className="sticky top-0 z-10 grid min-w-[760px] items-center gap-3 border-b border-border bg-background px-3"
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
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                  {sorted === "asc" ? " ↑" : null}
                  {sorted === "desc" ? " ↓" : null}
                </button>
              );
            })}
          </div>
          <div className="relative min-w-[760px]" style={{ height: virtualizer.getTotalSize() }}>
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
