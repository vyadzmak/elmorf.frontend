"use client";

import type { QueryExecution, QueryLanguage } from "@elmorf/domain";
import { ElmorfApiError, queryKeys, queryListOptions, modelOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { cn } from "@elmorf/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useShell } from "@/components/shell/shell-context";
import { QueryHistory } from "@/features/query/query-history";
import { QueryResultView } from "@/features/query/query-result";
import { useQuerySearch } from "@/features/query/use-query-search";
import { isNotFound, useApiClient } from "@/lib/use-api";

const emptyQueries: QueryExecution[] = [];

const modes = ["natural", "structured"] as const;

export function QueryWorkbench({ projectId }: { projectId: string }) {
  const t = useTranslations("Query");
  const shell = useTranslations("Shell");
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { search, commit } = useQuerySearch();
  const { commandOpen } = useShell();
  const [draftText, setDraftText] = useState<string | null>(null);
  const [draftLanguage, setDraftLanguage] = useState<QueryLanguage | null>(null);
  const modelQuery = useQuery({
    ...modelOptions(api, projectId),
    enabled: ready,
    retry: false,
  });
  const historyQuery = useQuery({
    ...queryListOptions(api, projectId),
    enabled: ready,
  });
  const history = historyQuery.data ?? emptyQueries;
  const selected = history.find((item) => item.id === search.query) ?? null;
  const text = draftText ?? selected?.text ?? "";
  const language = draftLanguage ?? selected?.language ?? "natural";
  const modelMissing = modelQuery.isError && isNotFound(modelQuery.error);
  const missing = Boolean(search.query && historyQuery.isSuccess && !selected);
  const active =
    selected?.state.status === "queued" || selected?.state.status === "running";

  const runMutation = useMutation({
    mutationFn: (input: { text: string; language: QueryLanguage }) =>
      api.queries.run(projectId, input),
    onSuccess: (execution) => {
      queryClient.setQueryData<QueryExecution[]>(queryKeys.list(projectId), (current) => [
        execution,
        ...(current ?? []).filter((item) => item.id !== execution.id),
      ]);
      commit({ query: execution.id });
    },
  });

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
      commit({ query: null });
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [commandOpen, commit]);

  function run(nextText = text, nextLanguage = language) {
    const trimmed = nextText.trim();
    if (!trimmed || nextLanguage === "structured" || modelMissing || runMutation.isPending || active) {
      return;
    }
    runMutation.mutate({ text: trimmed, language: nextLanguage });
  }

  const loading = !ready || historyQuery.isPending || modelQuery.isPending;
  const runError = runMutation.error;
  const runCode = runError instanceof ElmorfApiError ? runError.code : null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <h1 className="sr-only">{shell("navQuery")}</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex gap-1">
          {modes.map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={language === mode ? "default" : "outline"}
              onClick={() => {
                setDraftLanguage(mode);
              }}
            >
              {t(mode === "natural" ? "modeNatural" : "modeStructured")}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {modelQuery.isSuccess ? t("model", { version: modelQuery.data.version }) : modelMissing ? t("modelUnavailable") : null}
        </p>
      </div>
      {loading ? (
        <Skeleton className="m-4 h-40" />
      ) : historyQuery.isError ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{t("loadError")}</p>
      ) : (
        <div className="grid gap-6 px-4 py-4">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              run();
            }}
          >
            <textarea
              value={text}
              rows={4}
              readOnly={language === "structured"}
              placeholder={language === "structured" ? t("structuredPlaceholder") : t("placeholder")}
              aria-label={t("editorLabel")}
              className={cn(
                "w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                language === "structured" && "text-muted-foreground",
              )}
              onChange={(event) => {
                setDraftText(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  run();
                }
              }}
            />
            {language === "structured" ? (
              <p className="text-sm text-muted-foreground">{t("structuredUnavailable")}</p>
            ) : null}
            {modelMissing ? (
              <p className="text-sm text-muted-foreground">{t("modelUnavailableHint")}</p>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  language === "structured" ||
                  text.trim().length === 0 ||
                  modelMissing ||
                  runMutation.isPending ||
                  active
                }
              >
                {t("run")}
              </Button>
            </div>
          </form>
          {missing ? <p className="text-sm text-muted-foreground">{t("missing")}</p> : null}
          {runCode === "model_unavailable" ? (
            <p className="text-sm text-muted-foreground">{t("modelUnavailableHint")}</p>
          ) : null}
          {runCode === "structured_unavailable" ? (
            <p className="text-sm text-muted-foreground">{t("structuredUnavailable")}</p>
          ) : null}
          {runMutation.isError && runCode !== "model_unavailable" && runCode !== "structured_unavailable" ? (
            <p className="text-sm text-muted-foreground">{t("actionError")}</p>
          ) : null}
          {selected ? (
            <QueryResultView
              execution={selected}
              pending={runMutation.isPending || Boolean(active)}
              onDuplicate={() => {
                setDraftText(selected.text);
                setDraftLanguage(selected.language);
                commit({ query: null });
              }}
              onRunAgain={() => {
                run(selected.text, selected.language);
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("idle")}</p>
          )}
          <QueryHistory
            rows={history}
            selectedId={selected?.id ?? null}
            onSelect={(id) => {
              setDraftText(null);
              setDraftLanguage(null);
              commit({ query: id });
            }}
          />
        </div>
      )}
    </div>
  );
}
