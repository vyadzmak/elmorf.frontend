"use client";

import type { Evidence, QueryExecution, QueryResult } from "@elmorf/domain";
import { generateHttpQuery, generatePythonQuery } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { cn } from "@elmorf/ui/lib/utils";
import { useFormatter, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { objectTypeLabelKey } from "@/components/shell/nav";
import { QueryGraph } from "@/features/query/query-graph";

type ResultTab = "object" | "table" | "graph" | "json";
type CodeTab = "python" | "http";

const viewMessage = {
  object: "viewObject",
  table: "viewTable",
  graph: "viewGraph",
  json: "viewJson",
} as const;

const resultTabs: Record<QueryResult["kind"], ResultTab[]> = {
  object: ["object", "json"],
  table: ["table", "json"],
  graph: ["graph", "json"],
  json: ["json"],
  empty: [],
};

export function QueryResultView({
  execution,
  onRunAgain,
  onDuplicate,
  pending,
}: {
  execution: QueryExecution;
  onRunAgain: () => void;
  onDuplicate: () => void;
  pending: boolean;
}) {
  const t = useTranslations("Query");
  const shell = useTranslations("Shell");
  const format = useFormatter();
  const [tab, setTab] = useState<ResultTab | null>(null);
  const [codeTab, setCodeTab] = useState<CodeTab>("python");

  if (execution.state.status === "queued" || execution.state.status === "running") {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {execution.state.status === "queued" ? t("queued") : t("running")}
      </p>
    );
  }

  if (execution.state.status === "failed") {
    return (
      <div className="grid gap-2">
        <h2 className="text-sm font-medium">{t("errorTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("errorHint")}</p>
        {execution.state.error.message ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">{t("technical")}</summary>
            <p className="mt-2 font-mono text-xs">{execution.state.error.message}</p>
          </details>
        ) : null}
        <div className="flex gap-2">
          <Button type="button" disabled={pending} onClick={onRunAgain}>
            {t("runAgain")}
          </Button>
        </div>
      </div>
    );
  }

  if (execution.state.status === "cancelled") {
    return <p className="text-sm text-muted-foreground">{t("cancelled")}</p>;
  }

  const { result, evidence, elapsedMs, modelVersion } = execution.state;
  const tabs = resultTabs[result.kind];
  const active = tab && tabs.includes(tab) ? tab : tabs[0];
  const counts = resultCounts(result);
  const python = generatePythonQuery({
    projectId: execution.projectId,
    modelVersion,
    text: execution.text,
    language: execution.language,
  });
  const http = generateHttpQuery({
    projectId: execution.projectId,
    modelVersion,
    text: execution.text,
    language: execution.language,
  });
  const code = codeTab === "python" ? python : http;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {[
            t("objectCount", { count: counts.objects }),
            t("relationCount", { count: counts.relations }),
            t("elapsed", { time: format.number(elapsedMs) }),
            modelVersion,
          ].join(" · ")}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={pending} onClick={onDuplicate}>
            {t("duplicate")}
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={onRunAgain}>
            {t("runAgain")}
          </Button>
        </div>
      </div>
      {result.kind === "empty" ? (
        <p className="text-sm text-muted-foreground">{t("emptyResult")}</p>
      ) : (
        <section className="grid gap-3">
          <div className="flex gap-1">
            {tabs.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={active === item ? "default" : "outline"}
                onClick={() => {
                  setTab(item);
                }}
              >
                {t(viewMessage[item])}
              </Button>
            ))}
          </div>
          {active === "object" && result.kind === "object" ? (
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t("columnObject")}</dt>
                <dd className="font-medium">{result.object.label}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("columnType")}</dt>
                <dd>{shell(objectTypeLabelKey[result.object.type])}</dd>
              </div>
              {result.object.attributes.map((attribute) => (
                <div key={attribute.key}>
                  <dt className="text-xs text-muted-foreground">{attribute.key}</dt>
                  <dd>{attribute.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {active === "table" && result.kind === "table" ? (
            <div className="overflow-auto">
              <table className="w-full min-w-[28rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-xs text-muted-foreground">
                    {result.columns.map((column) => (
                      <th key={column} className="px-2 py-2 text-start font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={`${row.join("-")}-${index}`} className="border-b border-border">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className="px-2 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {active === "graph" && result.kind === "graph" ? <QueryGraph graph={result.graph} /> : null}
          {active === "json" ? <JsonBlock value={result} /> : null}
        </section>
      )}
      <EvidenceBlock items={evidence} />
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">{t("generated")}</h2>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={codeTab === "python" ? "default" : "outline"}
              onClick={() => {
                setCodeTab("python");
              }}
            >
              {t("python")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={codeTab === "http" ? "default" : "outline"}
              onClick={() => {
                setCodeTab("http");
              }}
            >
              {t("http")}
            </Button>
          </div>
        </div>
        <pre className="overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">{code}</pre>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void copyText(code, t("copied"), t("copyError"));
          }}
        >
          {t("copy")}
        </Button>
      </section>
    </div>
  );
}

function EvidenceBlock({ items }: { items: Evidence[] }) {
  const t = useTranslations("Query");
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">{t("evidence")}</h2>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm">{item.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  const t = useTranslations("Query");
  const text = JSON.stringify(value, null, 2);
  return (
    <div className="grid gap-2">
      <pre className="overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
        {highlightJson(text)}
      </pre>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void copyText(text, t("copied"), t("copyError"));
        }}
      >
        {t("copy")}
      </Button>
    </div>
  );
}

function highlightJson(text: string): ReactNode[] {
  const pattern = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const index = match.index;
    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }
    const className = match[1]
      ? "text-foreground"
      : cn(match[2] && "text-muted-foreground", match[3] && "text-foreground", match[4] && "text-muted-foreground");
    nodes.push(
      <span key={`${index}-${token}`} className={className}>
        {token}
      </span>,
    );
    cursor = index + token.length;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

function resultCounts(result: QueryResult): { objects: number; relations: number } {
  if (result.kind === "object") {
    return { objects: 1, relations: 0 };
  }
  if (result.kind === "table") {
    return { objects: result.rows.length, relations: 0 };
  }
  if (result.kind === "graph") {
    return { objects: result.graph.meta.totalNodes, relations: result.graph.meta.totalEdges };
  }
  return { objects: 0, relations: 0 };
}

async function copyText(value: string, copied: string, failed: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast(copied);
  } catch {
    toast(failed);
  }
}
