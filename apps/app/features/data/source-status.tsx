"use client";

import type { Source, SourceKind, SourceProcessing } from "@elmorf/domain";
import { cn } from "@elmorf/ui/lib/utils";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";

const kindLabelKey = {
  pdf: "kindPdf",
  csv: "kindCsv",
  xlsx: "kindXlsx",
  docx: "kindDocx",
  zip: "kindZip",
} as const;

const stageLabelKey = {
  extract: "stageExtract",
  normalize: "stageNormalize",
  index: "stageIndex",
} as const;

const byteUnits = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export function useSourceFormat() {
  const format = useFormatter();

  return useMemo(() => ({
    bytes(value: number): string {
      let amount = value;
      let unitIndex = 0;
      while (amount >= 1024 && unitIndex < byteUnits.length - 1) {
        amount /= 1024;
        unitIndex += 1;
      }

      const unit = byteUnits[unitIndex] ?? "byte";
      return format.number(amount, {
        style: "unit",
        unit,
        unitDisplay: "narrow",
        maximumFractionDigits: unitIndex === 0 ? 0 : 1,
      });
    },
    date(value: string): string {
      return format.dateTime(new Date(value), {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
    percent(value: number): string {
      return format.number(value, { style: "percent", maximumFractionDigits: 0 });
    },
  }), [format]);
}

export function sourceKindLabel(
  kind: SourceKind,
  t: ReturnType<typeof useTranslations<"Data">>,
): string {
  return t(kindLabelKey[kind]);
}

export function SourceStatusText({ processing }: { processing: SourceProcessing }) {
  const t = useTranslations("Data");
  const format = useSourceFormat();
  const progress =
    (processing.status === "uploading" || processing.status === "processing") &&
    processing.progress !== undefined
      ? format.percent(processing.progress)
      : null;

  let label = t("statusReady");
  if (processing.status === "queued") {
    label = t("statusQueued");
  } else if (processing.status === "uploading") {
    label = progress
      ? t("stageProgress", { stage: t("statusUploading"), progress })
      : t("statusUploading");
  } else if (processing.status === "processing") {
    const stage = t(stageLabelKey[processing.stage]);
    label = progress ? t("stageProgress", { stage, progress }) : stage;
  } else if (processing.status === "failed") {
    label = t("statusFailed");
  } else if (processing.status === "cancelled") {
    label = t("statusCancelled");
  } else {
    label = t("statusReady");
  }

  const dot =
    processing.status === "failed"
      ? "bg-[var(--elmorf-error)]"
      : processing.status === "ready"
        ? "bg-[var(--elmorf-success)]"
        : processing.status === "cancelled"
          ? "bg-muted-foreground"
          : "bg-[var(--elmorf-warning)]";

  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      <span className={processing.status === "failed" ? "text-destructive" : undefined}>{label}</span>
    </span>
  );
}

export function sourceStageLabel(source: Source, t: ReturnType<typeof useTranslations<"Data">>): string {
  if (source.processing.status !== "processing") {
    return "—";
  }

  return t(stageLabelKey[source.processing.stage]);
}
