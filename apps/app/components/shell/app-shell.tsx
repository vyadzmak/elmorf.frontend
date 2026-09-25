"use client";

import {
  ElmorfApiError,
  projectOptions,
  sessionOptions,
} from "@elmorf/api-client";
import {
  SidebarInset,
  SidebarProvider,
} from "@elmorf/ui/components/ui/sidebar";
import { TooltipProvider } from "@elmorf/ui/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopbar } from "@/components/shell/app-topbar";
import { CommandPalette } from "@/components/shell/command-palette";
import { InspectorHost } from "@/components/shell/inspector-host";
import {
  ShellContext,
  type InspectorPanel,
} from "@/components/shell/shell-context";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { rememberDestination, rememberProjectId } from "@/lib/recent-destinations";
import { useApiClient } from "@/lib/use-api";
import { projectIdFromPath, sectionFromPath } from "@/lib/workspace-path";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Shell");
  const missing = useTranslations("Foundation");
  const pathname = usePathname();
  const router = useRouter();
  const ready = useMockReady();
  const api = useApiClient();
  const projectId = projectIdFromPath(pathname);
  const section = sectionFromPath(pathname);
  const [inspector, setInspector] = useState<InspectorPanel | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const openInspector = useCallback((panel: InspectorPanel) => {
    setInspector(panel);
  }, []);
  const closeInspector = useCallback(() => {
    setInspector(null);
  }, []);
  const sessionQuery = useQuery({
    ...sessionOptions(api),
    enabled: ready,
  });
  const signedIn = sessionQuery.isSuccess && sessionQuery.data !== null;
  const projectQuery = useQuery({
    ...projectOptions(api, projectId ?? ""),
    enabled: signedIn && projectId !== null,
    retry: false,
  });

  useEffect(() => {
    if (ready && sessionQuery.isSuccess && sessionQuery.data === null) {
      router.replace("/login");
    }
  }, [ready, router, sessionQuery.data, sessionQuery.isSuccess]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    rememberProjectId(projectId);
    if (section) {
      rememberDestination({ projectId, section });
    }
  }, [projectId, section]);

  const projectMissing =
    projectQuery.isError &&
    projectQuery.error instanceof ElmorfApiError &&
    projectQuery.error.status === 404;
  const waiting =
    !ready ||
    sessionQuery.isPending ||
    (projectId !== null && projectQuery.isPending && !projectMissing);

  return (
    <ShellContext.Provider
      value={{
        inspector,
        openInspector,
        closeInspector,
        commandOpen,
        setCommandOpen,
      }}
    >
      <TooltipProvider>
        <SidebarProvider open onOpenChange={() => undefined} className="h-svh overflow-hidden">
          <AppSidebar
            projectId={projectId}
            projectName={projectQuery.data?.name ?? null}
          />
          <SidebarInset className="min-h-0 overflow-hidden">
            <AppTopbar projectId={projectId} session={sessionQuery.data ?? null} />
            <div className="min-h-0 flex-1">
              <InspectorHost>
                {waiting ? (
                  <WorkspacePage title={t("loading")} />
                ) : projectMissing ? (
                  <WorkspacePage title={missing("notFoundTitle")}>
                    <p className="text-sm text-muted-foreground">
                      {missing("notFoundDescription")}
                    </p>
                  </WorkspacePage>
                ) : (
                  children
                )}
              </InspectorHost>
            </div>
          </SidebarInset>
          <CommandPalette projectId={projectId} />
        </SidebarProvider>
      </TooltipProvider>
    </ShellContext.Provider>
  );
}
