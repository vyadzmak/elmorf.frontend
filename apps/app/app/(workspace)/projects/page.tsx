"use client";

import { projectListOptions } from "@elmorf/api-client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMockReady } from "@/components/app-providers";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";

export default function ProjectsPage() {
  const t = useTranslations("Shell");
  const ready = useMockReady();
  const api = useApiClient();
  const projectsQuery = useQuery({
    ...projectListOptions(api),
    enabled: ready,
  });
  const projects = projectsQuery.data ?? [];

  return (
    <WorkspacePage title={t("projectsTitle")} description={t("projectsDescription")}>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("projectsEmpty")}</p>
      ) : (
        <ul className="grid max-w-4xl gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={sectionHref(project.id, "overview")}
                className="group flex min-h-44 flex-col rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-5 transition-colors hover:bg-muted/50"
              >
                <FolderKanban className="size-5 text-primary" aria-hidden />
                <span className="mt-8 text-lg font-medium">{project.name}</span>
                <span className="mt-1 text-sm text-muted-foreground">{t("backToCorpus")}</span>
                <ArrowRight className="mt-auto size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/projects/new"
        className="flex max-w-4xl items-center gap-3 rounded-xl border border-dashed border-border px-5 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden />
        <span className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{t("createProject")}</span>
          <span className="text-xs">{t("sectionPending")}</span>
        </span>
      </Link>
    </WorkspacePage>
  );
}
