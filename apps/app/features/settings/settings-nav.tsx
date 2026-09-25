"use client";

import { projectListOptions } from "@elmorf/api-client";
import { cn } from "@elmorf/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMockReady } from "@/components/app-providers";
import { useApiClient } from "@/lib/use-api";
import { projectIdFromPath } from "@/lib/workspace-path";
import type { SettingsSectionId } from "@/features/settings/settings-section-id";

export type { SettingsSectionId } from "@/features/settings/settings-section-id";

export function SettingsNav({ active }: { active: SettingsSectionId }) {
  const t = useTranslations("Settings");
  const pathname = usePathname();
  const ready = useMockReady();
  const api = useApiClient();
  const projectsQuery = useQuery({
    ...projectListOptions(api),
    enabled: ready,
  });
  const projectId = projectIdFromPath(pathname) ?? projectsQuery.data?.[0]?.id ?? null;
  const projectItems = projectId
    ? [
        { id: "general" as const, label: t("navGeneral"), href: projectSettingsHref(projectId) },
        { id: "api-keys" as const, label: t("navApiKeys"), href: projectSettingsHref(projectId, "api-keys") },
        { id: "compilation" as const, label: t("navCompilation"), href: projectSettingsHref(projectId, "compilation") },
        { id: "integrations" as const, label: t("navIntegrations"), href: projectSettingsHref(projectId, "integrations") },
        { id: "danger" as const, label: t("navDanger"), href: projectSettingsHref(projectId, "danger") },
      ]
    : [];
  const accountItems = [
    { id: "appearance" as const, label: t("navAppearance"), href: "/settings/appearance" },
    { id: "profile" as const, label: t("navProfile"), href: "/settings/profile" },
    { id: "security" as const, label: t("navSecurity"), href: "/settings/security" },
  ];
  const isAccountSection = accountItems.some((item) => item.id === active);
  const groups = isAccountSection
    ? [
        { title: t("accountGroup"), items: accountItems },
        ...(projectItems.length > 0 ? [{ title: t("projectGroup"), items: projectItems }] : []),
      ]
    : [
        ...(projectItems.length > 0 ? [{ title: t("projectGroup"), items: projectItems }] : []),
        { title: t("accountGroup"), items: accountItems },
      ];

  return (
    <nav
      aria-label={t("navLabel")}
      className="-mx-5 flex gap-5 overflow-x-auto border-b border-border px-5 pb-3 lg:mx-0 lg:flex-col lg:gap-5 lg:overflow-visible lg:border-b-0 lg:px-0 lg:pb-0"
    >
      {groups.map((group) => (
        <NavGroup key={group.title} title={group.title} items={group.items} active={active} />
      ))}
    </nav>
  );
}

function NavGroup({
  title,
  items,
  active,
}: {
  title: string;
  items: { id: SettingsSectionId; label: string; href: string }[];
  active: SettingsSectionId;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <p className="hidden px-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground lg:block">{title}</p>
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className={cn(
                "block whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground lg:px-2 lg:py-1.5",
                item.id === "danger" && "text-destructive hover:text-destructive",
                item.id === active && "bg-muted font-medium text-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function projectSettingsHref(projectId: string, section?: string): string {
  const base = `/projects/${encodeURIComponent(projectId)}/settings`;
  return section ? `${base}/${section}` : base;
}
