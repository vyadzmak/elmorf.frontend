"use client";

import type { SourceKind } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
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
    <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3">
      <Input
        value={query}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("filterStatus")}</span>
        <FilterChip
          pressed={!search.status}
          label={t("filterAll")}
          onClick={() => {
            onChange({ status: null });
          }}
        />
        {dataStatusFilters.map((status) => (
          <FilterChip
            key={status}
            pressed={search.status === status}
            label={t(statusLabelKey[status])}
            onClick={() => {
              onChange({ status: search.status === status ? null : status });
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("filterKind")}</span>
        <FilterChip
          pressed={!search.kind}
          label={t("filterAll")}
          onClick={() => {
            onChange({ kind: null });
          }}
        />
        {sourceKinds.map((kind) => (
          <FilterChip
            key={kind}
            pressed={search.kind === kind}
            label={t(kindLabelKey[kind])}
            onClick={() => {
              onChange({ kind: search.kind === kind ? null : kind });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? "default" : "outline"}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
