"use client";

import {
  ElmorfApiError,
  currentCompilationOptions,
  modelOptions,
  morphologyGraphOptions,
  morphologyObjectOptions,
  queryDetailOptions,
  queryKeys,
  sourceListOptions,
} from "@elmorf/api-client";
import type { Compilation, QueryExecution } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { Input } from "@elmorf/ui/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTryApiClient } from "@/lib/use-try-api";
import { useTryMockReady } from "./try-providers";

const TRY_PROJECT_ID = "prj_vendor_contracts";

const TryGraph = dynamic(
  () => import("./try-graph").then((mod) => mod.TryGraph),
  { ssr: false },
);

function isNotFound(error: unknown): boolean {
  return error instanceof ElmorfApiError && error.status === 404;
}

function QueryResult({ execution }: { execution: QueryExecution }) {
  const t = useTranslations("Try");
  const state = execution.state;

  if (state.status === "queued" || state.status === "running") {
    return <p className="text-sm text-muted-foreground">{t("queryRunning")}</p>;
  }

  if (state.status === "failed") {
    return (
      <p className="text-sm text-destructive" role="alert">
        {t("queryFailed")}
      </p>
    );
  }

  if (state.status !== "completed") {
    return null;
  }

  const result = state.result;
  if (result.kind === "empty") {
    return <p className="text-sm text-muted-foreground">{t("queryEmpty")}</p>;
  }

  if (result.kind === "object") {
    return <p className="text-sm">{result.object.label}</p>;
  }

  if (result.kind === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {result.columns.map((column) => (
                <th key={column} className="border-b border-border px-2 py-1 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={`${result.columns.join("-")}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="border-b border-border px-2 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (result.kind === "graph") {
    return (
      <p className="text-sm text-muted-foreground">
        {t("modelSummary", {
          version: result.graph.modelVersion,
          objects: result.graph.meta.totalNodes,
          relations: result.graph.meta.totalEdges,
        })}
      </p>
    );
  }

  return <pre className="overflow-x-auto text-xs">{JSON.stringify(result.value, null, 2)}</pre>;
}

export function TryWorkbench({
  title,
  intro,
  signupHref,
  initialObject,
}: {
  title: string;
  intro: string;
  signupHref: string;
  initialObject?: string;
}) {
  const t = useTranslations("Try");
  const ready = useTryMockReady();
  const api = useTryApiClient();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(initialObject ?? "obj_inv_2041");
  const [queryText, setQueryText] = useState(t("sampleQuery"));
  const [engaged, setEngaged] = useState(false);
  const [queryId, setQueryId] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const sources = useQuery({
    ...sourceListOptions(api, TRY_PROJECT_ID),
    enabled: ready,
  });
  const model = useQuery({
    ...modelOptions(api, TRY_PROJECT_ID),
    enabled: ready,
    retry: false,
  });
  const compilation = useQuery({
    ...currentCompilationOptions(api, TRY_PROJECT_ID),
    enabled: ready,
    retry: false,
  });
  const graph = useQuery({
    ...morphologyGraphOptions(api, TRY_PROJECT_ID),
    enabled: ready,
  });
  const object = useQuery({
    ...morphologyObjectOptions(api, TRY_PROJECT_ID, selectedId ?? "pending"),
    enabled: ready && selectedId !== null,
  });
  const execution = useQuery({
    ...queryDetailOptions(api, TRY_PROJECT_ID, queryId ?? "pending"),
    enabled: ready && queryId !== null,
  });
  const run = useMutation({
    mutationFn: (text: string) =>
      api.queries.run(TRY_PROJECT_ID, { text, language: "natural" }),
    onSuccess: (next) => {
      setQueryId(next.id);
      queryClient.setQueryData(queryKeys.detail(TRY_PROJECT_ID, next.id), next);
    },
    onError: () => {
      setQueryError(t("queryFailed"));
    },
  });
  function statusLabel(status: Compilation["state"]["status"]): string {
    if (status === "queued") return t("statusQueued");
    if (status === "running") return t("statusRunning");
    if (status === "completed") return t("statusCompleted");
    if (status === "failed") return t("statusFailed");
    return t("statusCancelled");
  }

  function submitQuery(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      setQueryError(t("queryRequired"));
      return;
    }

    setQueryError(null);
    setQueryText(trimmed);
    setEngaged(true);
    run.mutate(trimmed);
  }

  const failed = sources.isError || graph.isError;
  const modelMissing = model.isError && isNotFound(model.error);

  return (
    <div className="flex flex-col gap-10 py-12">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{intro}</p>
      </header>

      {!ready || sources.isPending ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : null}
      {failed ? (
        <p className="text-sm text-destructive" role="alert">
          {t("unavailable")}
        </p>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="order-2 flex flex-col gap-8 lg:order-1">
      {sources.isSuccess ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{t("sourcesTitle")}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {sources.data.map((source) => (
              <li key={source.id} className="flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-xs">{source.name}</span>
                <span className="shrink-0 text-xs uppercase text-muted-foreground">{source.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">{t("modelTitle")}</h2>
        {model.isSuccess ? (
          <p className="text-sm">
            {t("modelSummary", {
              version: model.data.version,
              objects: model.data.objectCount,
              relations: model.data.relationCount,
            })}
            {compilation.isSuccess ? ` · ${statusLabel(compilation.data.state.status)}` : null}
          </p>
        ) : null}
        {modelMissing ? <p className="text-sm text-muted-foreground">{t("modelMissing")}</p> : null}
        <p className="text-sm text-muted-foreground">{t("alreadyCompiled")}</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{t("queryTitle")}</h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitQuery(queryText);
          }}
        >
          <label className="sr-only" htmlFor="try-query">
            {t("queryTitle")}
          </label>
          <Input
            id="try-query"
            value={queryText}
            placeholder={t("queryPlaceholder")}
            onChange={(event) => {
              setQueryText(event.target.value);
            }}
          />
          <Button type="submit" disabled={!ready || run.isPending} className="w-fit">
            {t("queryRun")}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          {t("sampleHint")} {t("sampleMeaning")}
        </p>
        {queryError ? (
          <p className="text-sm text-destructive" role="alert">
            {queryError}
          </p>
        ) : null}
        {execution.data ? <QueryResult execution={execution.data} /> : null}
      </section>
      </div>

      {graph.isSuccess ? (
        <div className="order-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:order-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">{t("morphologyTitle")}</h2>
          <TryGraph
            graph={graph.data}
            label={t("graphLabel")}
            selectedNodeId={selectedId}
            onSelectNode={(id) => {
              setSelectedId(id);
              setEngaged(true);
            }}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">{t("objectsTitle")}</h3>
            <ul className="flex flex-wrap gap-2">
              {graph.data.nodes.map((node) => (
                <li key={node.id}>
                  <Button
                    type="button"
                    size="sm"
                    variant={node.id === selectedId ? "default" : "outline"}
                    aria-pressed={node.id === selectedId}
                    onClick={() => {
                      setSelectedId(node.id);
                      setEngaged(true);
                    }}
                  >
                    {node.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex max-w-2xl flex-col gap-2">
            <h3 className="text-sm font-medium">{t("evidenceTitle")}</h3>
            {selectedId === null ? (
              <p className="text-sm text-muted-foreground">{t("selectObject")}</p>
            ) : null}
            {object.isSuccess && object.data.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noEvidence")}</p>
            ) : null}
            {object.isSuccess
              ? object.data.evidence.map((item) => (
                  <article key={item.id} className="rounded-lg border border-border bg-[var(--elmorf-surface-1)] p-3 text-sm">
                    <p className="font-medium">{object.data.label}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-2 font-mono text-xs">{item.excerpt}</p>
                  </article>
                ))
              : null}
            {object.isSuccess && object.data.conflicts.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">{t("conflictsTitle")}</h3>
                {object.data.conflicts.map((conflict) => (
                  <p key={conflict.id} className="text-sm">
                    {conflict.summary}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        </div>
      ) : null}
      </div>

      <aside className="flex max-w-xl flex-col gap-3 rounded-lg border border-border bg-[var(--elmorf-surface-1)] p-4">
        <h2 className="text-sm font-medium">{engaged ? t("ctaTitleEngaged") : t("ctaTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("ctaBody")} {t("opensWorkspace")}</p>
        <Button asChild className="w-fit">
          <a href={signupHref}>{t("createAccount")}</a>
        </Button>
      </aside>
    </div>
  );
}
