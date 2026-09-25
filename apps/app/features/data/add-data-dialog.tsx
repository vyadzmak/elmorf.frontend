"use client";

import {
  SOURCE_MAX_BYTES,
  SOURCE_MAX_FILES,
  sourceKindFromName,
  type SourceKind,
} from "@elmorf/domain";
import { sourceKeys } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@elmorf/ui/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useSourceFormat } from "@/features/data/source-status";
import { useApiClient } from "@/lib/use-api";

interface PendingFile {
  id: string;
  name: string;
  sizeBytes: number;
  kind: SourceKind | null;
  error: "unsupported" | "tooLarge" | "tooMany" | null;
}

export function AddDataDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Data");
  const format = useSourceFormat();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [submitError, setSubmitError] = useState(false);
  const limitLabel = format.bytes(SOURCE_MAX_BYTES);
  const readyFiles = files.filter((file) => file.kind && !file.error);
  const create = useMutation({
    mutationFn: () =>
      api.sources.create(projectId, {
        files: readyFiles.flatMap((file) =>
          file.kind
            ? [{ name: file.name, kind: file.kind, sizeBytes: file.sizeBytes }]
            : [],
        ),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sourceKeys.list(projectId) });
      setFiles([]);
      setSubmitError(false);
      onOpenChange(false);
    },
    onError: () => {
      setSubmitError(true);
    },
  });

  function addFiles(list: FileList | null) {
    if (!list) {
      return;
    }

    setSubmitError(false);
    setFiles((current) => {
      const next = [...current];
      for (const file of list) {
        const kind = sourceKindFromName(file.name);
        let error: PendingFile["error"] = null;
        if (!kind) {
          error = "unsupported";
        } else if (file.size > SOURCE_MAX_BYTES) {
          error = "tooLarge";
        } else if (next.filter((item) => !item.error).length >= SOURCE_MAX_FILES) {
          error = "tooMany";
        }

        next.push({
          id: crypto.randomUUID(),
          name: file.name,
          sizeBytes: file.size,
          kind,
          error,
        });
      }

      return next;
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setFiles([]);
          setSubmitError(false);
          setDragging(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" closeLabel={t("close")}>
        <DialogHeader>
          <DialogTitle>{t("add")}</DialogTitle>
          <DialogDescription>
            {t("supported", { size: limitLabel, count: SOURCE_MAX_FILES })}
          </DialogDescription>
        </DialogHeader>
        <div
          className={
            dragging
              ? "rounded-lg border border-ring bg-muted px-4 py-8 text-center"
              : "rounded-lg border border-dashed border-border px-4 py-8 text-center"
          }
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <p className="text-sm">{t("dropTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("dropOr")}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {t("browse")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.docx,.zip"
            className="sr-only"
            aria-label={t("browse")}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
        {files.length > 0 ? (
          <ul className="flex max-h-40 flex-col gap-2 overflow-auto">
            {files.map((file) => (
              <li key={file.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    {file.error === "unsupported"
                      ? t("unsupported")
                      : file.error === "tooLarge"
                        ? t("tooLarge", { size: limitLabel })
                        : file.error === "tooMany"
                          ? t("tooMany", { count: SOURCE_MAX_FILES })
                          : format.bytes(file.sizeBytes)}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles((current) => current.filter((item) => item.id !== file.id));
                  }}
                >
                  {t("remove")}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {submitError ? <p className="text-sm text-destructive">{t("addError")}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={readyFiles.length === 0 || create.isPending}
            onClick={() => {
              create.mutate();
            }}
          >
            {t("submit", { count: readyFiles.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
