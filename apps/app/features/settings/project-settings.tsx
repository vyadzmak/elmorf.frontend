"use client";

import {
  currentCompilationOptions,
  modelOptions,
  projectKeys,
  projectOptions,
} from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Input } from "@elmorf/ui/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@elmorf/ui/components/ui/alert-dialog";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { ApiKeysSection } from "@/features/settings/api-keys-section";
import { SettingRow, SettingsSection } from "@/features/settings/settings-section";
import { isNotFound, useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";
import type { SettingsSectionId } from "@/features/settings/settings-section-id";

export function ProjectSettings({
  projectId,
  section,
}: {
  projectId: string;
  section: SettingsSectionId;
}) {
  if (section === "api-keys") {
    return <ApiKeysSection projectId={projectId} />;
  }
  if (section === "compilation") {
    return <CompilationSettings projectId={projectId} />;
  }
  if (section === "integrations") {
    return <IntegrationsSettings />;
  }
  if (section === "danger") {
    return <DangerSettings projectId={projectId} />;
  }
  return <GeneralSettings projectId={projectId} />;
}

function GeneralSettings({ projectId }: { projectId: string }) {
  const t = useTranslations("Settings");
  const ready = useMockReady();
  const api = useApiClient();
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const modelQuery = useQuery({
    ...modelOptions(api, projectId),
    enabled: ready,
    retry: false,
  });

  if (projectQuery.isPending) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }
  if (projectQuery.isError || !projectQuery.data) {
    return <p className="text-sm text-destructive">{t("loadError")}</p>;
  }

  const modelVersion =
    modelQuery.isSuccess
      ? modelQuery.data.version
      : modelQuery.isError && isNotFound(modelQuery.error)
        ? t("noModel")
        : t("emptyValue");

  return (
    <SettingsSection title={t("generalTitle")} description={t("generalDescription")}>
      <SettingRow label={t("projectName")} description={t("nameLocked")}>
        <p className="text-sm">{projectQuery.data.name}</p>
      </SettingRow>
      <SettingRow label={t("currentModel")}>
        <p className="text-sm">{modelVersion}</p>
      </SettingRow>
    </SettingsSection>
  );
}

function CompilationSettings({ projectId }: { projectId: string }) {
  const t = useTranslations("Settings");
  const ready = useMockReady();
  const api = useApiClient();
  const compilationQuery = useQuery({
    ...currentCompilationOptions(api, projectId),
    enabled: ready,
    retry: false,
  });
  const compilation = compilationQuery.isSuccess ? compilationQuery.data : null;
  const missing = compilationQuery.isError && isNotFound(compilationQuery.error);

  return (
    <SettingsSection title={t("compilationTitle")} description={t("compilationDescription")}>
      <SettingRow label={t("currentCompilation")}>
        <p className="text-sm">
          {compilation
            ? `${compilation.version} · ${compilationStatusLabel(t, compilation.state.status)}`
            : missing
              ? t("noCompilation")
              : t("loading")}
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link href={sectionHref(projectId, "compile")}>{t("openCompile")}</Link>
        </Button>
      </SettingRow>
    </SettingsSection>
  );
}

function compilationStatusLabel(
  t: ReturnType<typeof useTranslations<"Settings">>,
  status: "queued" | "running" | "completed" | "failed" | "cancelled",
): string {
  switch (status) {
    case "queued":
      return t("compilationQueued");
    case "running":
      return t("compilationRunning");
    case "completed":
      return t("compilationCompleted");
    case "failed":
      return t("compilationFailed");
    case "cancelled":
      return t("compilationCancelled");
  }
}

function IntegrationsSettings() {
  const t = useTranslations("Settings");
  return (
    <SettingsSection title={t("integrationsTitle")} description={t("integrationsDescription")}>
      <p className="text-sm text-muted-foreground">{t("integrationsEmpty")}</p>
    </SettingsSection>
  );
}

function DangerSettings({ projectId }: { projectId: string }) {
  const t = useTranslations("Settings");
  const ready = useMockReady();
  const api = useApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const canDelete = projectQuery.data?.capabilities.canDeleteProject ?? false;
  const remove = useMutation({
    mutationFn: () => api.projects.delete(projectId),
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(t("projectDeleted"));
      router.push("/projects");
    },
    onError: () => {
      toast.error(t("projectDeleteError"));
    },
  });

  return (
    <SettingsSection title={t("dangerTitle")} description={t("dangerDescription")}>
      <SettingRow
        label={t("deleteProject")}
        description={canDelete ? t("deleteProjectDescription") : t("deleteProjectDenied")}
      >
        {canDelete ? (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-fit">
                {t("deleteProject")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("deleteTitle", { name: projectQuery.data?.name ?? "" })}
                </AlertDialogTitle>
                <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
              </AlertDialogHeader>
              <label className="grid gap-2 text-sm">
                {t("deleteTypePrompt")}
                <Input
                  value={confirmName}
                  autoComplete="off"
                  onChange={(event) => {
                    setConfirmName(event.target.value);
                  }}
                />
              </label>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={remove.isPending || confirmName !== (projectQuery.data?.name ?? "")}
                  onClick={(event) => {
                    event.preventDefault();
                    remove.mutate();
                  }}
                >
                  {t("deleteConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </SettingRow>
    </SettingsSection>
  );
}
