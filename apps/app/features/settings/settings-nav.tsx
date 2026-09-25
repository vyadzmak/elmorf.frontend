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

  return (
    <nav aria-label={t("navLabel")} className="flex flex-col gap-4">
      {projectItems.length > 0 ? (
        <NavGroup title={t("projectGroup")} items={projectItems} active={active} />
      ) : null}
      <NavGroup title={t("accountGroup")} items={accountItems} active={active} />
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
    <div className="flex flex-col gap-1">
      <p className="px-2 text-xs text-muted-foreground">{title}</p>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground",
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
