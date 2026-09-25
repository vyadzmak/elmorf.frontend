"use client";

import type { Compilation, ModelSummary } from "@elmorf/domain";
import { cn } from "@elmorf/ui/lib/utils";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { compilationDurationMs, durationPhrase } from "@/features/compile/format-duration";

const columns = "4.5rem 6rem 5.5rem 5.5rem 5.5rem 6rem 7.5rem 11rem";

const statusMessage = {
  queued: "statusQueued",
  running: "statusRunning",
  completed: "statusCompleted",
  failed: "statusFailed",
  cancelled: "statusCancelled",
} as const;

export function CompileHistory({
  rows,
  models,
  selectedId,
  now,
  onSelect,
}: {
  rows: Compilation[];
  models: ModelSummary[];
  selectedId: string | null;
  now: number;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Compile");
  const format = useFormatter();
  const clock = useNow({ updateInterval: 60_000 });

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h2 className="px-4 py-3 text-sm font-medium">{t("history")}</h2>
      {rows.length === 0 ? (
        <p className="px-4 py-2 text-sm text-muted-foreground">{t("emptyHistory")}</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <div
            className="sticky top-0 z-10 grid min-w-[760px] items-center gap-3 border-b border-border bg-background px-3"
            style={{ gridTemplateColumns: columns }}
          >
            {[
              t("columnVersion"),
              t("columnStatus"),
              t("columnSources"),
              t("columnObjects"),
              t("columnRelations"),
              t("columnConflicts"),
              t("columnDuration"),
              t("columnCreated"),
            ].map((label) => (
              <span key={label} className="h-9 truncate text-xs font-medium leading-9 text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
          {rows.map((row) => {
            const completed = row.state.status === "completed" ? row.state : null;
            const model = completed
              ? models.find((item) => item.id === completed.modelVersionId)
              : undefined;
            const duration = compilationDurationMs(row, now);
            const started = new Date(row.startedAt);
            const created = `${format.dateTime(started, {
              dateStyle: "medium",
              timeStyle: "short",
            })} · ${format.relativeTime(started, { now: clock })}`;
            const durationLabel =
              duration === null
                ? t("emptyValue")
                : (() => {
                    const phrase = durationPhrase(duration);
                    return "minutes" in phrase
                      ? t("durationMinutes", { count: phrase.minutes })
                      : phrase.clock;
                  })();
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={row.id === selectedId}
                className={cn(
                  "grid min-w-[760px] w-full items-center gap-3 border-b border-border px-3 py-2 text-start text-sm",
                  row.id === selectedId ? "bg-accent" : "hover:bg-muted",
                )}
                style={{ gridTemplateColumns: columns }}
                onClick={() => {
                  onSelect(row.id);
                }}
              >
                <span>{row.version}</span>
                <span>{t(statusMessage[row.state.status])}</span>
                <span>{model ? format.number(model.sourceCount) : t("emptyValue")}</span>
                <span>{model ? format.number(model.objectCount) : t("emptyValue")}</span>
                <span>{model ? format.number(model.relationCount) : t("emptyValue")}</span>
                <span>{model ? format.number(model.conflictCount) : t("emptyValue")}</span>
                <span className="font-mono text-xs tabular-nums">
                  {durationLabel}
                </span>
                <span className="truncate">{created}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

