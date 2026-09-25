"use client";

import { sourceKeys, sourceListOptions } from "@elmorf/api-client";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@elmorf/ui/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useMockReady } from "@/components/app-providers";
import {
  SourceStatusText,
  sourceKindLabel,
  useSourceFormat,
} from "@/features/data/source-status";
import { useApiClient } from "@/lib/use-api";

export function SourceInspector({
  projectId,
  sourceId,
  canManage,
  onDeleted,
}: {
  projectId: string;
  sourceId: string;
  canManage: boolean;
  onDeleted: () => void;
}) {
  const t = useTranslations("Data");
  const format = useSourceFormat();
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const sourcesQuery = useQuery({
    ...sourceListOptions(api, projectId),
    enabled: ready,
  });
  const source = sourcesQuery.data?.find((item) => item.id === sourceId);
  const [tab, setTab] = useState<"overview" | "processing" | "metadata" | "errors">("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: sourceKeys.list(projectId) });
  const retry = useMutation({
    mutationFn: () => api.sources.retry(projectId, sourceId),
    onSuccess: async () => {
      setActionError(false);
      await refresh();
    },
    onError: () => {
      setActionError(true);
    },
  });
  const cancel = useMutation({
    mutationFn: () => api.sources.cancel(projectId, sourceId),
    onSuccess: async () => {
      setActionError(false);
      await refresh();
    },
    onError: () => {
      setActionError(true);
    },
  });
  const remove = useMutation({
    mutationFn: () => api.sources.delete(projectId, sourceId),
    onSuccess: async () => {
      toast(t("deleted", { name: source?.name ?? sourceId }));
      setDeleteOpen(false);
      await refresh();
      onDeleted();
    },
  });
  if (!source) {
    return <p className="px-4 py-4 text-sm text-muted-foreground">{t("missing")}</p>;
  }

  const active =
    source.processing.status === "queued" ||
    source.processing.status === "uploading" ||
    source.processing.status === "processing";
  const failed = source.processing.status === "failed" ? source.processing.error : null;

  const visibleTab = tab === "errors" && !failed ? "overview" : tab;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["overview", t("overview")],
            ["processing", t("processingTitle")],
            ["metadata", t("metadata")],
            ...(failed ? [["errors", t("errors")] as const] : []),
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={visibleTab === id ? "secondary" : "ghost"}
            onClick={() => {
              setTab(id);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      {visibleTab === "overview" ? (
      <section className="flex flex-col gap-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t("columnType")}</dt>
          <dd>{sourceKindLabel(source.kind, t)}</dd>
          <dt className="text-muted-foreground">{t("columnSize")}</dt>
          <dd>{format.bytes(source.sizeBytes)}</dd>
          <dt className="text-muted-foreground">{t("added")}</dt>
          <dd>{format.date(source.createdAt)}</dd>
          <dt className="text-muted-foreground">{t("columnStatus")}</dt>
          <dd>
            <SourceStatusText processing={source.processing} />
          </dd>
        </dl>
      </section>
      ) : null}
      {visibleTab === "processing" ? (
      <section className="flex flex-col gap-2">
        {source.processing.status === "ready" ? (
          <ol className="grid gap-1 text-sm">
            <li className="text-muted-foreground">{t("timelineQueued")}</li>
            <li className="text-muted-foreground">{t("timelineUploaded")}</li>
            <li>
              {t("finished")} · {format.date(source.processing.completedAt)}
            </li>
          </ol>
        ) : null}
        {source.processing.status === "cancelled" ? (
          <p className="text-sm">
            {t("cancelledAt")} · {format.date(source.processing.cancelledAt)}
          </p>
        ) : null}
        {active ? <SourceStatusText processing={source.processing} /> : null}
        {canManage && active ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={cancel.isPending}
            onClick={() => {
              cancel.mutate();
            }}
          >
            {t("cancelProcessing")}
          </Button>
        ) : null}
      </section>
      ) : null}
      {visibleTab === "metadata" ? (
      <section className="flex flex-col gap-2">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t("idLabel")}</dt>
          <dd className="truncate font-mono text-xs">{source.id}</dd>
        </dl>
      </section>
      ) : null}
      {visibleTab === "errors" && failed ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">{t("errors")}</h3>
          <p className="text-sm text-destructive">
            {failed.code === "source_unreadable" ? t("errorUnreadable") : t("errorGeneric")}
          </p>
          {failed.message ? (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">{t("technical")}</summary>
              <p className="mt-2 font-mono text-xs">{failed.message}</p>
            </details>
          ) : null}
          {canManage && failed.retryable ? (
            <Button
              type="button"
              size="sm"
              className="self-start"
              disabled={retry.isPending}
              onClick={() => {
                retry.mutate();
              }}
            >
              {t("retry")}
            </Button>
          ) : null}
        </section>
      ) : null}
      {actionError ? <p className="text-sm text-destructive">{t("actionError")}</p> : null}
      {canManage ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="self-start"
          onClick={() => {
            setDeleteOpen(true);
          }}
        >
          {t("delete")}
        </Button>
      ) : null}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle", { name: source.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          {remove.isError ? <p className="text-sm text-destructive">{t("deleteError")}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                remove.mutate();
              }}
            >
              {t("deleteConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
