"use client";

import type { SourceKind } from "@elmorf/domain";
import { Input } from "@elmorf/ui/components/ui/input";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  dataStatusFilters,
  type DataSearch,
  type DataSearchPatch,
  type DataStatusFilter,
} from "@/features/data/search-params";

const sourceKinds = ["pdf", "csv", "xlsx", "docx", "zip"] as const;

const statusLabelKey: Record<DataStatusFilter, "statusProcessing" | "statusReady" | "statusFailed" | "statusCancelled"> = {
  processing: "statusProcessing",
  ready: "statusReady",
  failed: "statusFailed",
  cancelled: "statusCancelled",
};

const kindLabelKey: Record<SourceKind, "kindPdf" | "kindCsv" | "kindXlsx" | "kindDocx" | "kindZip"> = {
  pdf: "kindPdf",
  csv: "kindCsv",
  xlsx: "kindXlsx",
  docx: "kindDocx",
  zip: "kindZip",
};

export function DataToolbar({
  search,
  onChange,
}: {
  search: DataSearch;
  onChange: (patch: DataSearchPatch) => void;
}) {
  const t = useTranslations("Data");
  const [draft, setDraft] = useState<string | null>(null);
  const query = draft ?? search.q ?? "";

  useEffect(() => {
    if (draft === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      const next = draft.trim();
      if (next !== (search.q ?? "")) {
        onChange({ q: next.length > 0 ? next : null });
        return;
      }

      setDraft(null);
    }, 200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [draft, onChange, search.q]);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-[var(--elmorf-surface-1)] px-5 py-3 lg:px-6">
      <Input
        value={query}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="w-full sm:max-w-sm"
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        {t("filterStatus")}
        <select
          className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          value={search.status ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              status: value.length > 0 ? (value as (typeof dataStatusFilters)[number]) : null,
            });
          }}
        >
          <option value="">{t("filterAll")}</option>
          {dataStatusFilters.map((status) => (
            <option key={status} value={status}>
              {t(statusLabelKey[status])}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        {t("filterKind")}
        <select
          className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          value={search.kind ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ kind: value.length > 0 ? (value as (typeof sourceKinds)[number]) : null });
          }}
        >
          <option value="">{t("filterAll")}</option>
          {sourceKinds.map((kind) => (
            <option key={kind} value={kind}>
              {t(kindLabelKey[kind])}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
