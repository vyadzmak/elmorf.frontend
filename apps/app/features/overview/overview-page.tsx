"use client";

import type { Compilation, ModelSummary, QueryExecution, Source } from "@elmorf/domain";
import {
  currentCompilationOptions,
  modelListOptions,
  modelOptions,
  projectOptions,
  queryListOptions,
  sourceListOptions,
} from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useNow, useTranslations } from "next-intl";
import Link from "next/link";
import { useMockReady } from "@/components/app-providers";
import { MetricStrip } from "@/features/overview/metric-strip";
import { ProjectHealth } from "@/features/overview/project-health";
import { RecentActivity } from "@/features/overview/recent-activity";
import { SourceMix } from "@/features/overview/source-mix";
import { deriveSystemStatus } from "@/lib/system-status";
import { isNotFound, useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";

const emptySources: Source[] = [];
const emptyModels: ModelSummary[] = [];
const emptyQueries: QueryExecution[] = [];

export function OverviewPage({ projectId }: { projectId: string }) {
  const t = useTranslations("Overview");
  const data = useTranslations("Data");
  const compile = useTranslations("Compile");
  const format = useFormatter();
  const clock = useNow({ updateInterval: 60_000 });
  const ready = useMockReady();
  const api = useApiClient();
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const sourcesQuery = useQuery({
    ...sourceListOptions(api, projectId),
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
  const compilationQuery = useQuery({
    ...currentCompilationOptions(api, projectId),
    enabled: ready,
    retry: false,
  });
  const queriesQuery = useQuery({
    ...queryListOptions(api, projectId),
    enabled: ready,
  });

  if (!ready || projectQuery.isPending || sourcesQuery.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (projectQuery.isError || sourcesQuery.isError) {
    return <p className="text-sm text-destructive">{t("loadError")}</p>;
  }

  const project = projectQuery.data;
  const sources = sourcesQuery.data ?? emptySources;
  const model = modelQuery.isSuccess ? modelQuery.data : null;
  const compilation = compilationQuery.isSuccess ? compilationQuery.data : null;
  const models = [...(modelsQuery.data ?? emptyModels)].sort((left, right) =>
    left.createdAt < right.createdAt ? -1 : 1,
  );
  const queries = queriesQuery.data ?? emptyQueries;
  const status = deriveSystemStatus(sources, compilation);
  const modelMissing = modelQuery.isError && isNotFound(modelQuery.error);
  const isEmpty = sources.length === 0 && (modelMissing || model === null);

  const dataValue =
    status.tone === "processing"
      ? t("dataProcessing")
      : status.tone === "attention" && status.failedSourceCount > 0
        ? t("dataAttention")
        : t("dataReady");

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {t("healthModel")}
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
              {model ? t("modelVersion", { version: model.version }) : t("noModel")}
            </h2>
            {models.length === 1 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("singleVersion", { version: models[0]?.version ?? "" })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={sectionHref(projectId, "morphology")}>{t("openMorphology")}</Link>
            </Button>
            <Button asChild>
              <Link href={sectionHref(projectId, "query")}>{t("ask")}</Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-5">
          <MetricStrip
            items={[
              {
                label: compile("sources"),
                value: format.number(sources.length),
                href: sectionHref(projectId, "data"),
              },
              {
                label: compile("objects"),
                value: format.number(model?.objectCount ?? 0),
                href: sectionHref(projectId, "morphology"),
              },
              {
                label: compile("relations"),
                value: format.number(model?.relationCount ?? 0),
                href: sectionHref(projectId, "morphology"),
              },
              {
                label: compile("conflicts"),
                value:
                  (model?.conflictCount ?? 0) === 0
                    ? t("conflictsNone")
                    : format.number(model?.conflictCount ?? 0),
                href: `${sectionHref(projectId, "morphology")}?conflict=1`,
              },
            ]}
          />
        </div>
      </section>
      {isEmpty ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border px-4 py-6">
          <h2 className="text-sm font-medium">{t("emptyTitle")}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">{t("emptyBody")}</p>
          {project.capabilities.canAddData ? (
            <Button asChild className="w-fit">
              <Link href={sectionHref(projectId, "data")}>{data("add")}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectHealth
          title={t("healthTitle")}
          rows={[
            { label: t("healthData"), value: dataValue },
            {
              label: t("healthCompilation"),
              value: compilationLabel(t, compilation),
            },
            {
              label: t("healthModel"),
              value: model
                ? format.dateTime(new Date(model.createdAt), { dateStyle: "medium" })
                : t("noModel"),
            },
          ]}
        />
        {sources.length > 0 ? (
          <SourceMix
            title={t("sourceMixTitle")}
            segments={[
              {
                key: "ready",
                label: data("statusReady"),
                count: sources.filter((source) => source.processing.status === "ready").length,
                className: "bg-[var(--elmorf-success)]",
              },
              {
                key: "active",
                label: t("mixActive"),
                count: status.processingCount,
                className: "bg-[var(--elmorf-warning)]",
              },
              {
                key: "failed",
                label: data("statusFailed"),
                count: status.failedSourceCount,
                className: "bg-[var(--elmorf-error)]",
              },
              {
                key: "cancelled",
                label: data("statusCancelled"),
                count: sources.filter((source) => source.processing.status === "cancelled").length,
                className: "bg-muted-foreground",
              },
            ]}
          />
        ) : null}
      </div>
      {models.length > 1 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">{t("versionsTitle")}</h2>
          <ul className="flex flex-col gap-2">
            {models.map((item) => {
              const peak = Math.max(...models.map((version) => version.objectCount), 1);
              return (
                <li key={item.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="text-sm">{item.version}</span>
                  {models.length > 1 ? (
                    <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full bg-primary"
                        style={{ width: `${(item.objectCount / peak) * 100}%` }}
                      />
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {t("versionCounts", {
                      objects: format.number(item.objectCount),
                      relations: format.number(item.relationCount),
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <RecentActivity
        title={t("activityTitle")}
        empty={t("activityEmpty")}
        items={activityItems({
          projectId,
          sources,
          compilation,
          queries,
          fileMark: t("activityFile"),
          compileMark: t("activityCompile"),
          queryMark: t("activityQuery"),
          compilationTitle: t("healthCompilation"),
          when: (value) => format.relativeTime(new Date(value), { now: clock }),
        })}
      />
    </div>
  );
}

function compilationLabel(
  t: ReturnType<typeof useTranslations<"Overview">>,
  compilation: Compilation | null,
): string {
  if (!compilation) {
    return t("compilationNone");
  }
  const version = compilation.version;
  switch (compilation.state.status) {
    case "queued":
      return t("compilationQueued", { version });
    case "running":
      return t("compilationRunning", { version });
    case "completed":
      return t("compilationReady", { version });
    case "failed":
      return t("compilationFailed", { version });
    case "cancelled":
      return t("compilationCancelled", { version });
  }
}

function activityItems({
  projectId,
  sources,
  compilation,
  queries,
  fileMark,
  compileMark,
  queryMark,
  compilationTitle,
  when,
}: {
  projectId: string;
  sources: Source[];
  compilation: Compilation | null;
  queries: QueryExecution[];
  fileMark: string;
  compileMark: string;
  queryMark: string;
  compilationTitle: string;
  when: (value: string) => string;
}) {
  const latestSource = [...sources].sort((left, right) =>
    left.createdAt < right.createdAt ? 1 : -1,
  )[0];
  const latestQuery = queries[0];
  const items = [];

  if (latestSource) {
    items.push({
      id: latestSource.id,
      href: `${sectionHref(projectId, "data")}?source=${encodeURIComponent(latestSource.id)}`,
      mark: fileMark,
      title: latestSource.name,
      detail: when(latestSource.createdAt),
    });
  }
  if (compilation) {
    items.push({
      id: compilation.id,
      href: `${sectionHref(projectId, "compile")}?compilation=${encodeURIComponent(compilation.id)}`,
      mark: compileMark,
      title: compilationTitle,
      detail: when(compilation.startedAt),
    });
  }
  if (latestQuery) {
    const stamp =
      latestQuery.state.status === "completed"
        ? latestQuery.state.completedAt
        : latestQuery.state.status === "cancelled"
          ? latestQuery.state.cancelledAt
          : null;
    items.push({
      id: latestQuery.id,
      href: `${sectionHref(projectId, "query")}?query=${encodeURIComponent(latestQuery.id)}`,
      mark: queryMark,
      title: latestQuery.text,
      detail: stamp ? when(stamp) : "—",
    });
  }

  return items;
}
