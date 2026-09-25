"use client";

import type { Compilation, CompilationStageName } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { Check, Circle, LoaderCircle, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { compilationDurationMs, durationPhrase, formatDuration } from "@/features/compile/format-duration";

const stageKeys = {
  bones: "stageBones",
  flesh: "stageFlesh",
  compile: "stageCompile",
} as const;

function StageMark({ state }: { state: Compilation["stages"][number]["state"] }) {
  if (state === "completed") {
    return <Check className="size-4" aria-hidden />;
  }
  if (state === "running") {
    return <LoaderCircle className="size-4 animate-spin" aria-hidden />;
  }
  if (state === "failed") {
    return <TriangleAlert className="size-4" aria-hidden />;
  }
  return <Circle className="size-3" aria-hidden />;
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
  const elapsed =
    duration === null
      ? t("emptyValue")
      : (() => {
          const phrase = durationPhrase(duration);
          return "minutes" in phrase
            ? t("durationMinutes", { count: phrase.minutes })
            : phrase.clock;
        })();
  const status =
    compilation.state.status === "queued"
      ? t("queuedStatus")
      : compilation.state.status === "completed"
        ? elapsed
        : t("runningStatus", { elapsed });

  return (
    <section className="border-b border-border px-5 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {compilation.version}
          </p>
          <h2 className="mt-1 text-xl font-medium tracking-tight">
            {t("runningTitle", { version: compilation.version })}
          </h2>
          <p role="status" className="mt-1 text-sm text-muted-foreground">
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
      <ol className="mt-6 grid gap-3 md:grid-cols-3">
        {compilation.stages.map((stage) => (
          <li
            key={stage.name}
            className="rounded-lg border border-border bg-[var(--elmorf-surface-1)] p-4"
          >
            <span className={stage.state === "failed" ? "text-destructive" : "text-primary"}>
              <StageMark state={stage.state} />
            </span>
            <p className="mt-6 text-base font-medium">{t(stageKeys[stage.name])}</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              {stage.elapsedMs === undefined
                ? t("emptyValue")
                : (() => {
                    const phrase = durationPhrase(stage.elapsedMs);
                    return "minutes" in phrase
                      ? t("durationMinutes", { count: phrase.minutes })
                      : formatDuration(stage.elapsedMs);
                  })()}
            </p>
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
