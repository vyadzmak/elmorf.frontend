"use client";

import { projectListOptions } from "@elmorf/api-client";
import { useQuery } from "@tanstack/react-query";
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
    <WorkspacePage title={t("projectsTitle")}>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("projectsEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={sectionHref(project.id, "overview")}
                className="text-sm underline-offset-4 hover:underline"
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/projects/new"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("createProject")}
      </Link>
    </WorkspacePage>
  );
}
