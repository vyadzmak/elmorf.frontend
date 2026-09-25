"use client";

import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@elmorf/ui/components/ui/sidebar";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectSwitcher } from "@/components/shell/project-switcher";
import { settingsIcon, workspaceNav } from "@/components/shell/nav";
import { useCloseMobileSidebar } from "@/components/shell/use-close-mobile-sidebar";
import { isSettingsPath, sectionFromPath, sectionHref } from "@/lib/workspace-path";

export function AppSidebar({
  projectId,
  projectName,
}: {
  projectId: string | null;
  projectName: string | null;
}) {
  const t = useTranslations("Shell");
  const pathname = usePathname();
  const closeMobileSidebar = useCloseMobileSidebar();
  const activeSection = sectionFromPath(pathname);
  const settingsHref = projectId
    ? `/projects/${encodeURIComponent(projectId)}/settings`
    : "/settings/appearance";
  const SettingsIcon = settingsIcon;

  return (
    <Sidebar
      collapsible="offcanvas"
      sheetTitle={t("sidebarTitle")}
      sheetDescription={t("sidebarDescription")}
    >
      <SidebarHeader className="gap-3">
        <Link
          href={projectId ? sectionHref(projectId, "overview") : "/projects"}
          onClick={closeMobileSidebar}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-sidebar-accent-foreground"
        >
          <ElmorfMark className="size-5" />
          {t("brand")}
        </Link>
        <ProjectSwitcher projectId={projectId} projectName={projectName} />
      </SidebarHeader>
      <SidebarContent>
        {projectId ? (
          <SidebarGroup>
            <SidebarMenu>
              {workspaceNav.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeSection === item.section}
                  >
                    <Link
                      href={sectionHref(projectId, item.section)}
                      onClick={closeMobileSidebar}
                    >
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isSettingsPath(pathname)}>
              <Link href={settingsHref} onClick={closeMobileSidebar}>
                <SettingsIcon />
                <span>{t("navSettings")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
