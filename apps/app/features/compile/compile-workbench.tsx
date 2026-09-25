"use client";

import type { Compilation, ModelSummary } from "@elmorf/domain";
import {
  compilationHistoryOptions,
  compileKeys,
  currentCompilationOptions,
  modelKeys,
  modelListOptions,
  modelOptions,
  projectKeys,
  projectOptions,
  sourceListOptions,
} from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useNow, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useShell } from "@/components/shell/shell-context";
import { CompileHistory } from "@/features/compile/compile-history";
import { CompileLogs } from "@/features/compile/compile-logs";
import { CompilePipeline, stageNameLabel } from "@/features/compile/compile-pipeline";
import { useCompileParams } from "@/features/compile/use-compile-params";
import { isNotFound, useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";

const emptyCompilations: Compilation[] = [];
const emptyModels: ModelSummary[] = [];

export function CompileWorkbench({ projectId }: { projectId: string }) {
  const t = useTranslations("Compile");
  const shell = useTranslations("Shell");
  const format = useFormatter();
  const clock = useNow({ updateInterval: 30_000 });
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { search, commit } = useCompileParams();
  const { commandOpen, openInspector, closeInspector } = useShell();
  const ownsInspector = useRef(false);
  const seen = useRef<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const sourcesQuery = useQuery({
    ...sourceListOptions(api, projectId),
    enabled: ready,
  });
  const currentQuery = useQuery({
    ...currentCompilationOptions(api, projectId),
    enabled: ready,
    retry: false,
  });
  const historyQuery = useQuery({
    ...compilationHistoryOptions(api, projectId),
    enabled: ready,
  });
  const modelQuery = useQuery({
    ...modelOptions(api, projectId),
    enabled: ready,
    retry: false,
  });
  const modelsQuery = useQuery({
    ...modelListOptions(api, projectId),
    enabled: ready,
  });
  const history = historyQuery.data ?? emptyCompilations;
  const models = modelsQuery.data ?? emptyModels;
  const current = currentQuery.isSuccess ? currentQuery.data : null;
  const active =
    current?.state.status === "queued" || current?.state.status === "running";
  const canCompile = projectQuery.data?.capabilities.canCompile ?? false;
  const readySources =
    sourcesQuery.data?.filter((source) => source.processing.status === "ready").length ?? 0;
  const selected = history.find((item) => item.id === search.compilation) ?? null;
  const selectedId = selected?.id ?? null;
  const selectedVersion = selected?.version ?? null;
  const missing = Boolean(search.compilation && historyQuery.isSuccess && !selected);
  const modelMissing = modelQuery.isError && isNotFound(modelQuery.error);
  const currentMissing = currentQuery.isError && isNotFound(currentQuery.error);

  const startMutation = useMutation({
    mutationFn: () => api.compilations.start(projectId),
    onSuccess: (compilation) => {
      queryClient.setQueryData(compileKeys.current(projectId), compilation);
      void queryClient.invalidateQueries({ queryKey: compileKeys.history(projectId) });
    },
    onError: () => {
      toast(t("actionError"));
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (compilationId: string) => api.compilations.cancel(projectId, compilationId),
    onSuccess: (compilation) => {
      queryClient.setQueryData(compileKeys.current(projectId), compilation);
      void queryClient.invalidateQueries({ queryKey: compileKeys.history(projectId) });
    },
    onError: () => {
      toast(t("actionError"));
    },
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [active]);

  useEffect(() => {
    const compilation = currentQuery.data;
    if (!compilation) {
      return;
    }

    const marker = `${compilation.id}:${compilation.state.status}`;
    const previous = seen.current;
    seen.current = marker;
    if (!previous || previous === marker) {
      return;
    }

    const [previousId, previousStatus] = previous.split(":");
    if (previousId !== compilation.id || previousStatus === compilation.state.status) {
      return;
    }

    if (compilation.state.status === "completed") {
      toast(t("completedToast", { version: compilation.version }));
      void queryClient.invalidateQueries({ queryKey: modelKeys.current(projectId) });
      void queryClient.invalidateQueries({ queryKey: modelKeys.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId, "morphology"] });
    } else if (compilation.state.status === "failed") {
      toast(t("failedToast"));
    }
  }, [currentQuery.data, projectId, queryClient, t]);

  useEffect(() => {
    if (!selectedId || !selectedVersion) {
      if (ownsInspector.current) {
        closeInspector();
        ownsInspector.current = false;
      }
      return;
    }

    ownsInspector.current = true;
    openInspector({
      title: t("logsTitle", { version: selectedVersion }),
      content: <CompileLogs projectId={projectId} compilationId={selectedId} />,
      onClose: () => {
        commit({ compilation: null });
      },
    });
  }, [
    closeInspector,
    commit,
    openInspector,
    projectId,
    selectedId,
    selectedVersion,
    t,
  ]);

  useEffect(() => {
    return () => {
      if (ownsInspector.current) {
        closeInspector();
        ownsInspector.current = false;
      }
    };
  }, [closeInspector]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || commandOpen) {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        document.querySelector("[data-slot='alert-dialog-content']")
      ) {
        return;
      }

      commit({ compilation: null });
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [commandOpen, commit]);

  const loading =
    !ready ||
    currentQuery.isPending ||
    historyQuery.isPending ||
    modelQuery.isPending ||
    sourcesQuery.isPending;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h1 className="sr-only">{shell("navCompile")}</h1>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-6">
        <p className="text-base font-medium">
          {modelQuery.isSuccess
            ? t("currentModel", {
                version: modelQuery.data.version,
                when: format.relativeTime(new Date(modelQuery.data.createdAt), { now: clock }),
              })
            : modelMissing
              ? t("noModel")
              : null}
        </p>
        {canCompile ? (
          <Button
            type="button"
            disabled={active || readySources === 0 || startMutation.isPending}
            onClick={() => {
              startMutation.mutate();
            }}
          >
            {t("start")}
          </Button>
        ) : null}
      </div>
      {canCompile && modelQuery.isSuccess ? (
        <p className="border-b border-border bg-[var(--elmorf-surface-1)] px-5 py-3 text-sm text-muted-foreground lg:px-6">
          {t("keepsModel", { version: modelQuery.data.version })}
        </p>
      ) : null}
      {loading ? (
        <Skeleton className="m-4 h-40" />
      ) : currentQuery.isError && !currentMissing ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{t("loadError")}</p>
      ) : (
        <>
          {modelQuery.isSuccess ? (
            <dl className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
              <Count
                label={`${t("sources")} · ${t("inVersion", { version: modelQuery.data.version })}`}
                value={format.number(modelQuery.data.sourceCount)}
              />
              <Count label={t("objects")} value={format.number(modelQuery.data.objectCount)} />
              <Count label={t("relations")} value={format.number(modelQuery.data.relationCount)} />
              <Count label={t("conflicts")} value={format.number(modelQuery.data.conflictCount)} />
            </dl>
          ) : modelMissing ? (
            <p className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
              {t("noModelHint")}
            </p>
          ) : null}
          {canCompile && readySources === 0 ? (
            <p className="px-4 py-2 text-sm text-muted-foreground">{t("needSources")}</p>
          ) : null}
          {missing ? (
            <p className="px-4 py-2 text-sm text-muted-foreground">{t("missing")}</p>
          ) : null}
          {current && (active || current.state.status === "completed") ? (
            <CompilePipeline
              compilation={current}
              now={now}
              canCancel={canCompile && active}
              pending={cancelMutation.isPending}
              onCancel={() => {
                cancelMutation.mutate(current.id);
              }}
              onInspect={() => {
                commit({ compilation: current.id });
              }}
            />
          ) : null}
          {current?.state.status === "failed" ? (
            <section className="border-b border-border bg-[var(--elmorf-surface-1)] px-5 py-6 lg:px-6">
              <h2 className="text-xl font-medium tracking-tight">
                {t("failedTitle", { stage: stageNameLabel("flesh", t) })}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {modelQuery.isSuccess
                  ? t("failedHint", { version: modelQuery.data.version })
                  : t("failedNoModel")}
              </p>
              {current.state.status === "failed" && current.state.error.message ? (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {current.state.error.message}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    commit({ compilation: current.id });
                  }}
                >
                  {t("viewLogs")}
                </Button>
                {canCompile ? (
                  <Button
                    type="button"
                    disabled={readySources === 0 || startMutation.isPending}
                    onClick={() => {
                      startMutation.mutate();
                    }}
                  >
                    {t("retry")}
                  </Button>
                ) : null}
              </div>
            </section>
          ) : current?.state.status === "completed" && modelQuery.isSuccess ? (
            <section className="border-b border-border bg-[var(--elmorf-surface-1)] px-5 py-6 lg:px-6">
              <h2 className="text-xl font-medium tracking-tight">
                {t("completedTitle", { version: modelQuery.data.version })}
              </h2>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="outline">
                  <Link href={sectionHref(projectId, "morphology")}>
                    {t("openMorphologyVersion", { version: modelQuery.data.version })}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={sectionHref(projectId, "query")}>
                    {t("runQueryVersion", { version: modelQuery.data.version })}
                  </Link>
                </Button>
              </div>
            </section>
          ) : current?.state.status === "cancelled" ? (
            <p className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
              {t("cancelledLine", { version: current.version })}
            </p>
          ) : null}
          {current && !selectedId ? (
            <CompileLogs projectId={projectId} compilationId={current.id} />
          ) : null}
          <CompileHistory
            rows={history}
            models={models}
            selectedId={selectedId}
            now={now}
            onSelect={(id) => {
              commit({ compilation: id });
            }}
          />
        </>
      )}
    </div>
  );
}

function Count({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-5 py-4 lg:px-6">
      <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{value}</dd>
    </div>
  );
}
