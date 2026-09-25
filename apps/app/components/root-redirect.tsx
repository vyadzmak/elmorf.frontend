"use client";

import { projectListOptions, sessionOptions } from "@elmorf/api-client";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMockReady } from "@/components/app-providers";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { readRecentProjectId } from "@/lib/recent-destinations";
import { useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";

export function RootRedirect() {
  const t = useTranslations("Shell");
  const router = useRouter();
  const ready = useMockReady();
  const api = useApiClient();
  const sessionQuery = useQuery({
    ...sessionOptions(api),
    enabled: ready,
  });
  const signedIn = sessionQuery.isSuccess && sessionQuery.data !== null;
  const projectsQuery = useQuery({
    ...projectListOptions(api),
    enabled: signedIn,
  });

  useEffect(() => {
    if (!ready || sessionQuery.isPending) {
      return;
    }

    if (!sessionQuery.data) {
      router.replace("/login");
      return;
    }

    if (!projectsQuery.isSuccess) {
      return;
    }

    const projects = projectsQuery.data;
    if (projects.length === 0) {
      router.replace("/projects");
      return;
    }

    const recent = readRecentProjectId();
    const project = projects.find((item) => item.id === recent) ?? projects[0];
    if (project) {
      router.replace(sectionHref(project.id, "overview"));
    }
  }, [
    projectsQuery.data,
    projectsQuery.isSuccess,
    ready,
    router,
    sessionQuery.data,
    sessionQuery.isPending,
  ]);

  return <WorkspacePage title={t("loading")} />;
}
