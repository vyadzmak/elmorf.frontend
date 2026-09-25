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
    <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3">
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("filterType")}</span>
        <Button
          type="button"
          size="sm"
          variant={search.type ? "outline" : "default"}
          aria-pressed={!search.type}
          onClick={() => {
            onChange({ type: null });
          }}
        >
          {t("filterAll")}
        </Button>
        {objectTypes.map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant={search.type === type ? "default" : "outline"}
            aria-pressed={search.type === type}
            onClick={() => {
              onChange({ type: search.type === type ? null : type });
            }}
          >
            {shell(objectTypeLabelKey[type])}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("filterRelation")}</span>
        <Button
          type="button"
          size="sm"
          variant={search.relationType ? "outline" : "default"}
          aria-pressed={!search.relationType}
          onClick={() => {
            onChange({ relationType: null });
          }}
        >
          {t("filterAll")}
        </Button>
        {relationTypes.map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant={search.relationType === type ? "default" : "outline"}
            aria-pressed={search.relationType === type}
            onClick={() => {
              onChange({ relationType: search.relationType === type ? null : type });
            }}
          >
            {t(relationTypeLabelKey[type])}
          </Button>
        ))}
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
    </div>
  );
}
