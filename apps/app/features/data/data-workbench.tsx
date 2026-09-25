"use client";

import type { Source } from "@elmorf/domain";
import { projectOptions, sourceListOptions } from "@elmorf/api-client";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { Button } from "@elmorf/ui/components/ui/button";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useShell } from "@/components/shell/shell-context";
import { AddDataDialog } from "@/features/data/add-data-dialog";
import { DataToolbar } from "@/features/data/data-toolbar";
import { sourceMatches } from "@/features/data/search-params";
import { SourceInspector } from "@/features/data/source-inspector";
import { SourceTable } from "@/features/data/source-table";
import { useDataParams } from "@/features/data/use-data-params";
import { useApiClient } from "@/lib/use-api";

const emptySources: Source[] = [];

export function DataWorkbench({ projectId }: { projectId: string }) {
  const t = useTranslations("Data");
  const shell = useTranslations("Shell");
  const ready = useMockReady();
  const api = useApiClient();
  const { search, commit } = useDataParams();
  const { commandOpen, openInspector, closeInspector } = useShell();
  const ownsInspector = useRef(false);
  const seenStatus = useRef<Map<string, string> | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const sourcesQuery = useQuery({
    ...sourceListOptions(api, projectId),
    enabled: ready,
  });
  const sources = sourcesQuery.data ?? emptySources;
  const visible = useMemo(
    () => sources.filter((source) => sourceMatches(source, search)),
    [search, sources],
  );
  const known = sources.find((source) => source.id === search.source) ?? null;
  const active = known && visible.some((source) => source.id === known.id) ? known : null;
  const filteredOut = Boolean(search.source && known && !active);
  const missing = Boolean(search.source && sourcesQuery.isSuccess && !known);
  const canManage = projectQuery.data?.capabilities.canAddData ?? false;
  const processingCount = sources.filter((source) => {
    const status = source.processing.status;
    return status === "queued" || status === "uploading" || status === "processing";
  }).length;
  const failedCount = sources.filter((source) => source.processing.status === "failed").length;
  const summary = [
    t("sourceCount", { count: sources.length }),
    processingCount > 0 ? t("processingCount", { count: processingCount }) : null,
    failedCount > 0 ? t("failedCount", { count: failedCount }) : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");

  useEffect(() => {
    if (!sourcesQuery.data) {
      return;
    }

    const next = new Map(sourcesQuery.data.map((source) => [source.id, source.processing.status]));
    const previous = seenStatus.current;
    if (previous) {
      let failed = 0;
      for (const [id, status] of next) {
        const prior = previous.get(id);
        if (status === "failed" && prior && prior !== "failed") {
          failed += 1;
        }
      }
      if (failed > 0) {
        toast(t("failedToast", { count: failed }));
      }
    }
    seenStatus.current = next;
  }, [sourcesQuery.data, t]);

  const activeId = active?.id ?? null;
  const activeName = active?.name ?? null;

  useEffect(() => {
    if (!activeId || !activeName) {
      if (ownsInspector.current) {
        closeInspector();
        ownsInspector.current = false;
      }
      return;
    }

    ownsInspector.current = true;
    openInspector({
      title: activeName,
      content: (
        <SourceInspector
          projectId={projectId}
          sourceId={activeId}
          canManage={canManage}
          onDeleted={() => {
            commit({ source: null });
          }}
        />
      ),
      onClose: () => {
        commit({ source: null });
      },
    });
  }, [activeId, activeName, canManage, closeInspector, commit, openInspector, projectId]);

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
      if (event.key !== "Escape" || commandOpen || addOpen) {
        return;
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        document.querySelector("[data-slot='alert-dialog-content']")
      ) {
        return;
      }

      commit({ source: null });
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [addOpen, commandOpen, commit]);

  const loading = !ready || sourcesQuery.isPending;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h1 className="sr-only">{shell("navData")}</h1>
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <p role="status" className="text-sm text-muted-foreground">
          {loading ? null : summary}
        </p>
        {canManage ? (
          <Button
            type="button"
            onClick={() => {
              setAddOpen(true);
            }}
          >
            {t("add")}
          </Button>
        ) : null}
      </div>
      <DataToolbar search={search} onChange={commit} />
      {filteredOut && known ? (
        <p className="shrink-0 px-4 py-2 text-sm text-muted-foreground">
          {t("selectionHidden", { label: known.name })}
        </p>
      ) : null}
      {missing ? (
        <p className="shrink-0 px-4 py-2 text-sm text-muted-foreground">{t("missing")}</p>
      ) : null}
      <div className="min-h-0 flex-1">
        {loading ? (
          <Skeleton className="m-4 h-[calc(100%-2rem)]" />
        ) : sourcesQuery.isError ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{t("loadError")}</p>
        ) : sources.length === 0 ? (
          <div className="flex flex-col items-start gap-3 px-4 py-6">
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            {canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setAddOpen(true);
                }}
              >
                {t("add")}
              </Button>
            ) : null}
          </div>
        ) : (
          <SourceTable
            rows={visible}
            selectedId={active?.id ?? null}
            emptyLabel={t("emptyFiltered")}
            countLabel={t("sourceCount", { count: visible.length })}
            onSelect={(id) => {
              commit({ source: id });
            }}
          />
        )}
      </div>
      {canManage ? (
        <AddDataDialog projectId={projectId} open={addOpen} onOpenChange={setAddOpen} />
      ) : null}
    </div>
  );
}
