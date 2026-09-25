"use client";

import {
  currentCompilationOptions,
  modelOptions,
  sourceListOptions,
} from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@elmorf/ui/components/ui/popover";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { cn } from "@elmorf/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMockReady } from "@/components/app-providers";
import { deriveSystemStatus, type SystemTone } from "@/lib/system-status";
import { isNotFound, useApiClient } from "@/lib/use-api";

const toneClassName: Record<SystemTone, string> = {
  ready: "bg-[var(--elmorf-success)]",
  processing: "bg-[var(--elmorf-warning)]",
  compiling: "bg-[var(--elmorf-warning)]",
  attention: "bg-[var(--elmorf-error)]",
};

function activeSources(statuses: string[] | undefined): boolean {
  return (
    statuses?.some(
      (status) =>
        status === "queued" || status === "uploading" || status === "processing",
    ) ?? false
  );
}

export function GlobalSystemStatus({ projectId }: { projectId: string | null }) {
  const t = useTranslations("Shell");
  const loadError = useTranslations("Foundation")("loadError");
  const ready = useMockReady();
  const api = useApiClient();
  const enabled = ready && projectId !== null;
  const sourcesQuery = useQuery({
    ...sourceListOptions(api, projectId ?? ""),
    enabled,
    refetchInterval: (query) =>
      activeSources(query.state.data?.map((source) => source.processing.status))
        ? 5000
        : false,
  });
  const compilationQuery = useQuery({
    ...currentCompilationOptions(api, projectId ?? ""),
    enabled,
    retry: false,
  });
  const modelQuery = useQuery({
    ...modelOptions(api, projectId ?? ""),
    enabled,
    retry: false,
  });

  if (!projectId) {
    return null;
  }

  const compilationMissing =
    compilationQuery.isError && isNotFound(compilationQuery.error);
  const settled =
    sourcesQuery.isSuccess && (compilationQuery.isSuccess || compilationMissing);

  if (!settled || !sourcesQuery.data) {
    return <Skeleton className="h-8 w-24" />;
  }

  const compilation = compilationQuery.isSuccess ? compilationQuery.data : null;
  const status = deriveSystemStatus(sourcesQuery.data, compilation);
  const label = {
    ready: t("statusReady"),
    processing: t("statusProcessing"),
    compiling: t("statusCompiling"),
    attention: t("statusAttention"),
  }[status.tone];
  const compilationLabel = compilationMissing
    ? t("statusIdle")
    : compilationQuery.isError
      ? loadError
      : status.compilationStatus === "running" || status.compilationStatus === "queued"
        ? t("statusRunning", { version: status.compilationVersion ?? "" })
        : status.compilationStatus === "failed"
          ? t("statusFailed")
          : t("statusIdle");
  const modelLabel = modelQuery.isSuccess
    ? modelQuery.data.version
    : modelQuery.isError && isNotFound(modelQuery.error)
      ? t("statusNoModel")
      : modelQuery.isError
        ? loadError
        : t("loading");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-8 gap-2 px-2.5 font-normal">
          <span className={cn("size-1.5 rounded-full", toneClassName[status.tone])} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-3">
        <StatusRow
          label={t("statusData")}
          value={
            sourcesQuery.isError
              ? loadError
              : status.processingCount > 0
                ? t("statusProcessingCount", { count: status.processingCount })
                : t("statusIdle")
          }
        />
        <StatusRow label={t("statusCompilation")} value={compilationLabel} />
        <StatusRow label={t("statusModel")} value={modelLabel} />
      </PopoverContent>
    </Popover>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{value}</span>
    </div>
  );
}
