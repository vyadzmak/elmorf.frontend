"use client";

import type { CompilationLogEntry, CompilationLogLevel } from "@elmorf/domain";
import { compilationHistoryOptions, compilationLogsOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Input } from "@elmorf/ui/components/ui/input";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { cn } from "@elmorf/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useApiClient } from "@/lib/use-api";

const emptyLogs: CompilationLogEntry[] = [];

const levels = ["all", "info", "warning", "error"] as const;

type LevelFilter = (typeof levels)[number];

const levelMessage = {
  all: "logAll",
  info: "logInfo",
  warning: "logWarning",
  error: "logError",
} as const;

export function CompileLogs({
  projectId,
  compilationId,
}: {
  projectId: string;
  compilationId: string;
}) {
  const t = useTranslations("Compile");
  const format = useFormatter();
  const ready = useMockReady();
  const api = useApiClient();
  const [level, setLevel] = useState<LevelFilter>("all");
  const [query, setQuery] = useState("");
  const historyQuery = useQuery({
    ...compilationHistoryOptions(api, projectId),
    enabled: ready,
  });
  const active =
    historyQuery.data?.some(
      (item) =>
        item.id === compilationId &&
        (item.state.status === "queued" || item.state.status === "running"),
    ) ?? false;
  const logsQuery = useQuery({
    ...compilationLogsOptions(api, projectId, compilationId, active),
    enabled: ready,
  });
  const logs = logsQuery.data ?? emptyLogs;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((entry) => {
      if (level !== "all" && entry.level !== level) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return entry.message.toLowerCase().includes(needle) || entry.stage.includes(needle);
    });
  }, [level, logs, query]);

  async function copyDiagnostics() {
    const text = visible
      .map((entry) => `${entry.timestamp} ${entry.level} ${entry.stage} ${entry.message}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast(t("copied"));
    } catch {
      toast(t("copyError"));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {levels.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={level === item ? "default" : "outline"}
            onClick={() => {
              setLevel(item);
            }}
          >
            {t(levelMessage[item])}
          </Button>
        ))}
      </div>
      <Input
        value={query}
        placeholder={t("logSearch")}
        aria-label={t("logSearch")}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <Button type="button" variant="outline" onClick={() => void copyDiagnostics()}>
        {t("copy")}
      </Button>
      {logsQuery.isError ? (
        <p className="text-sm text-muted-foreground">{t("loadError")}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("logEmpty")}</p>
      ) : (
        <ol className="max-h-80 overflow-auto font-mono text-xs">
          {visible.map((entry) => (
            <li key={entry.id} className="grid grid-cols-[4.5rem_4.5rem_1fr] gap-2 border-b border-border py-1.5">
              <span className="tabular-nums text-muted-foreground">
                {format.dateTime(new Date(entry.timestamp), { timeStyle: "medium" })}
              </span>
              <span className={cn(entry.level === "error" && "text-destructive", entry.level === "warning" && "text-muted-foreground")}>
                {levelLabel(entry.level, t)}
              </span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function levelLabel(
  level: CompilationLogLevel,
  t: ReturnType<typeof useTranslations<"Compile">>,
): string {
  return t(levelMessage[level]);
}
