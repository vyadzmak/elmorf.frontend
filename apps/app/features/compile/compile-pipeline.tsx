"use client";

import type { Compilation, CompilationStageName } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { useTranslations } from "next-intl";
import { compilationDurationMs, formatDuration } from "@/features/compile/format-duration";

const stageKeys = {
  bones: "stageBones",
  flesh: "stageFlesh",
  compile: "stageCompile",
} as const;

function stageMark(state: Compilation["stages"][number]["state"]): string {
  if (state === "completed") {
    return "✓";
  }
  if (state === "running") {
    return "●";
  }
  if (state === "failed") {
    return "!";
  }

  return "·";
}

export function CompilePipeline({
  compilation,
  now,
  canCancel,
  pending,
  onCancel,
  onInspect,
}: {
  compilation: Compilation;
  now: number;
  canCancel: boolean;
  pending: boolean;
  onCancel: () => void;
  onInspect: () => void;
}) {
  const t = useTranslations("Compile");
  const duration = compilationDurationMs(compilation, now);
  const status =
    compilation.state.status === "queued"
      ? t("queuedStatus")
      : t("runningStatus", { elapsed: duration === null ? t("emptyValue") : formatDuration(duration) });

  return (
    <section className="border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">{t("runningTitle", { version: compilation.version })}</h2>
          <p role="status" className="text-sm text-muted-foreground">
            {status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onInspect}>
            {t("viewLogs")}
          </Button>
          {canCancel ? (
            <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
              {t("cancel")}
            </Button>
          ) : null}
        </div>
      </div>
      <ol className="mt-3 grid gap-1">
        {compilation.stages.map((stage) => (
          <li
            key={stage.name}
            className="grid grid-cols-[1fr_auto_4.5rem] items-center gap-3 text-sm"
          >
            <span>{t(stageKeys[stage.name])}</span>
            <span className={stage.state === "failed" ? "text-destructive" : "text-muted-foreground"}>
              {stageMark(stage.state)}
            </span>
            <span className="text-end font-mono text-xs tabular-nums text-muted-foreground">
              {stage.elapsedMs === undefined ? t("emptyValue") : formatDuration(stage.elapsedMs)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function stageNameLabel(
  name: CompilationStageName,
  t: ReturnType<typeof useTranslations<"Compile">>,
): string {
  return t(stageKeys[name]);
}
