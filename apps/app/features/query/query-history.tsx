"use client";

import type { QueryExecution } from "@elmorf/domain";
import { cn } from "@elmorf/ui/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

const statusMessage = {
  queued: "statusQueued",
  running: "statusRunning",
  completed: "statusCompleted",
  failed: "statusFailed",
  cancelled: "statusCancelled",
} as const;

const languageMessage = {
  natural: "modeNatural",
  structured: "modeStructured",
} as const;

export function QueryHistory({
  rows,
  selectedId,
  onSelect,
}: {
  rows: QueryExecution[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Query");
  const format = useFormatter();

  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">{t("history")}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("emptyHistory")}</p>
      ) : (
        <div className="overflow-auto">
          <div className="grid min-w-[640px] grid-cols-[1fr_7rem_7rem_4rem_5rem] gap-3 border-b border-border px-1 text-xs font-medium text-muted-foreground">
            <span className="py-2">{t("columnQuery")}</span>
            <span className="py-2">{t("columnMode")}</span>
            <span className="py-2">{t("columnStatus")}</span>
            <span className="py-2">{t("columnModel")}</span>
            <span className="py-2">{t("columnTime")}</span>
          </div>
          {rows.map((row) => {
            const model = row.state.status === "completed" ? row.state.modelVersion : t("emptyValue");
            const elapsed =
              row.state.status === "completed"
                ? t("elapsed", { time: format.number(row.state.elapsedMs) })
                : t("emptyValue");
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={row.id === selectedId}
                className={cn(
                  "grid min-w-[640px] w-full grid-cols-[1fr_7rem_7rem_4rem_5rem] gap-3 border-b border-border px-1 py-2 text-start text-sm",
                  row.id === selectedId ? "bg-accent" : "hover:bg-muted",
                )}
                onClick={() => {
                  onSelect(row.id);
                }}
              >
                <span className="truncate">{row.text}</span>
                <span>{t(languageMessage[row.language])}</span>
                <span>{t(statusMessage[row.state.status])}</span>
                <span>{model}</span>
                <span className="tabular-nums">{elapsed}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
