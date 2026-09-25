"use client";

import type { Session } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { SidebarTrigger } from "@elmorf/ui/components/ui/sidebar";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { GlobalSystemStatus } from "@/components/shell/global-system-status";
import { workspaceNav } from "@/components/shell/nav";
import { useShell } from "@/components/shell/shell-context";
import { UserMenu } from "@/components/shell/user-menu";
import { isSettingsPath, sectionFromPath } from "@/lib/workspace-path";

export function AppTopbar({
  projectId,
  session,
}: {
  projectId: string | null;
  session: Session | null;
}) {
  const t = useTranslations("Shell");
  const pathname = usePathname();
  const { setCommandOpen } = useShell();
  const section = sectionFromPath(pathname);
  const navItem = workspaceNav.find((item) => item.section === section);
  const title = navItem
    ? t(navItem.labelKey)
    : isSettingsPath(pathname)
      ? pathname.endsWith("/appearance")
        ? t("appearance")
        : pathname.endsWith("/profile")
          ? t("profile")
          : pathname.endsWith("/security")
            ? t("security")
            : t("navSettings")
      : pathname === "/projects/new"
        ? t("createProjectTitle")
        : t("projectsTitle");

  return (
    <header className="flex h-[var(--app-topbar-height)] shrink-0 items-center gap-3 border-b border-border px-3">
      <SidebarTrigger className="xl:hidden" aria-label={t("openSidebar")} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
      <Button
        type="button"
        variant="outline"
        className="h-8 gap-2 px-2 font-normal text-muted-foreground"
        onClick={() => {
          setCommandOpen(true);
        }}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">{t("commandLabel")}</span>
        <kbd className="hidden font-mono text-xs sm:inline">{t("commandShortcut")}</kbd>
      </Button>
      <GlobalSystemStatus projectId={projectId} />
      {session ? <UserMenu session={session} /> : null}
    </header>
  );
}
