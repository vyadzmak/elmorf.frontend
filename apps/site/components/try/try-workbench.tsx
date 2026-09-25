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
}: {
  title: string;
  intro: string;
  signupHref: string;
}) {
  const t = useTranslations("Try");
  const ready = useTryMockReady();
  const api = useTryApiClient();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
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

      {sources.isSuccess ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{t("sourcesTitle")}</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {sources.data.map((source) => (
              <li key={source.id}>{source.name}</li>
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
      </section>

      {graph.isSuccess ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">{t("morphologyTitle")}</h2>
          <TryGraph
            graph={graph.data}
            label={t("graphLabel")}
            selectedNodeId={selectedId}
            onSelectNode={setSelectedId}
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
                  <blockquote key={item.id} className="border-l border-border pl-3 text-sm">
                    <p>{item.excerpt}</p>
                    <p className="mt-1 text-muted-foreground">{item.label}</p>
                  </blockquote>
                ))
              : null}
          </div>
        </section>
      ) : null}

      <section className="flex max-w-2xl flex-col gap-3">
        <h2 className="text-lg font-medium">{t("queryTitle")}</h2>
        <form
          className="flex flex-col gap-3 sm:flex-row"
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
          <Button type="submit" disabled={!ready || run.isPending}>
            {t("queryRun")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!ready || run.isPending}
            onClick={() => {
              submitQuery(t("sampleQuery"));
            }}
          >
            {t("querySample")}
          </Button>
        </form>
        {queryError ? (
          <p className="text-sm text-destructive" role="alert">
            {queryError}
          </p>
        ) : null}
        {execution.data ? <QueryResult execution={execution.data} /> : null}
      </section>

      <aside className="flex max-w-xl flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-lg font-medium">{t("ctaTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("ctaBody")}</p>
        <Button asChild className="w-fit">
          <a href={signupHref}>{t("createAccount")}</a>
        </Button>
      </aside>
    </div>
  );
}
