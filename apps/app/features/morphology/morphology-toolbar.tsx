"use client";

import type { ObjectType } from "@elmorf/domain";
import { morphologySearchOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Input } from "@elmorf/ui/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { objectTypeLabelKey } from "@/components/shell/nav";
import type { MorphologySearch, MorphologySearchPatch } from "@/features/morphology/search-params";
import { relationTypeLabelKey, relationTypes } from "@/features/morphology/relation-labels";
import { useApiClient } from "@/lib/use-api";

const objectTypes = Object.keys(objectTypeLabelKey) as ObjectType[];

export function MorphologyToolbar({
  projectId,
  search,
  layoutPhase,
  onChange,
  onFit,
}: {
  projectId: string;
  search: MorphologySearch;
  layoutPhase: "arranging" | "ready";
  onChange: (patch: MorphologySearchPatch) => void;
  onFit: () => void;
}) {
  const t = useTranslations("Morphology");
  const shell = useTranslations("Shell");
  const ready = useMockReady();
  const api = useApiClient();
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersActive = Boolean(search.type || search.relationType || search.conflict);
  const results = useQuery({
    ...morphologySearchOptions(api, projectId, deferredQuery),
    enabled: ready && open && deferredQuery.length > 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDeferredQuery(query.trim());
    }, 200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-[var(--elmorf-surface-1)] px-5 py-3 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant={search.view === "graph" ? "default" : "outline"}
            aria-pressed={search.view === "graph"}
            onClick={() => {
              onChange({ view: "graph" });
            }}
          >
            {t("viewGraph")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={search.view === "objects" ? "default" : "outline"}
            aria-pressed={search.view === "objects"}
            onClick={() => {
              onChange({ view: "objects" });
            }}
          >
            {t("viewObjects")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={search.view === "relations" ? "default" : "outline"}
            aria-pressed={search.view === "relations"}
            onClick={() => {
              onChange({ view: "relations" });
            }}
          >
            {t("viewRelations")}
          </Button>
        </div>
        <div className="relative min-w-40 flex-1 sm:max-w-xs">
          <Input
            value={query}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                setOpen(false);
              }
            }}
          />
          {open && deferredQuery.length > 0 ? (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
              {results.data && results.data.length > 0 ? (
                <ul>
                  {results.data.map((hit) => (
                    <li key={hit.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted"
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={() => {
                          onChange({
                            view: "graph",
                            object: hit.id,
                            relation: null,
                            ...(search.type && search.type !== hit.type ? { type: null } : {}),
                          });
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        <span className="truncate">{hit.label}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {shell(objectTypeLabelKey[hit.type])}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">{t("searchEmpty")}</p>
              )}
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant={filtersActive ? "secondary" : "outline"}
          aria-pressed={filtersOpen || filtersActive}
          onClick={() => {
            setFiltersOpen((current) => !current);
          }}
        >
          {t("showFilters")}
        </Button>
        {search.view === "graph" ? (
          <Button type="button" size="sm" variant="outline" onClick={onFit}>
            {t("fit")}
          </Button>
        ) : null}
        {search.view === "graph" && layoutPhase === "arranging" ? (
          <p role="status" className="text-xs text-muted-foreground">
            {t("arranging")}
          </p>
        ) : null}
      </div>
      {filtersOpen || filtersActive ? (
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("filterType")}
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={search.type ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ type: value.length > 0 ? (value as (typeof objectTypes)[number]) : null });
            }}
          >
            <option value="">{t("filterAll")}</option>
            {objectTypes.map((type) => (
              <option key={type} value={type}>
                {shell(objectTypeLabelKey[type])}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("filterRelation")}
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={search.relationType ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                relationType: value.length > 0 ? (value as (typeof relationTypes)[number]) : null,
              });
            }}
          >
            <option value="">{t("filterAll")}</option>
            {relationTypes.map((type) => (
              <option key={type} value={type}>
                {t(relationTypeLabelKey[type])}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant={search.conflict ? "default" : "outline"}
          aria-pressed={search.conflict}
          onClick={() => {
            onChange({ conflict: !search.conflict });
          }}
        >
          {t("filterConflict")}
        </Button>
      </div>
      ) : null}
    </div>
  );
}
