"use client";

import {
  morphologyGraphOptions,
  morphologySearchOptions,
  projectListOptions,
} from "@elmorf/api-client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@elmorf/ui/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { morphologyObjectHref } from "@/features/morphology/search-params";
import { workspaceNav } from "@/components/shell/nav";
import { useShell } from "@/components/shell/shell-context";
import { useCloseMobileSidebar } from "@/components/shell/use-close-mobile-sidebar";
import {
  readRecentDestinations,
  type RecentDestination,
} from "@/lib/recent-destinations";
import { useApiClient } from "@/lib/use-api";
import { sectionHref } from "@/lib/workspace-path";

export function CommandPalette({ projectId }: { projectId: string | null }) {
  const t = useTranslations("Shell");
  const { commandOpen, setCommandOpen, openInspector } = useShell();
  const router = useRouter();
  const closeMobileSidebar = useCloseMobileSidebar();
  const ready = useMockReady();
  const api = useApiClient();
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  const recent = (commandOpen ? readRecentDestinations() : []).filter(
    (item) =>
      item.projectId !== projectId ||
      !workspaceNav.some((entry) => entry.section === item.section),
  );
  const projectsQuery = useQuery({
    ...projectListOptions(api),
    enabled: ready && commandOpen,
  });
  const graphQuery = useQuery({
    ...morphologyGraphOptions(api, projectId ?? ""),
    enabled: ready && commandOpen && projectId !== null && deferredQuery.length === 0,
  });
  const searchQuery = useQuery({
    ...morphologySearchOptions(api, projectId ?? "", deferredQuery),
    enabled: ready && commandOpen && projectId !== null && deferredQuery.length > 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDeferredQuery(query.trim());
    }, 200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      setCommandOpen(!commandOpen);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [commandOpen, setCommandOpen]);

  function closeAndGo(href: string) {
    setCommandOpen(false);
    setQuery("");
    closeMobileSidebar();
    router.push(href);
  }

  const labelFor = (section: RecentDestination["section"]) => {
    const item = workspaceNav.find((entry) => entry.section === section);
    return item ? t(item.labelKey) : section;
  };

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title={t("commandTitle")}
      description={t("commandDescription")}
      showCloseButton={false}
    >
      <Command>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t("commandPlaceholder")}
        />
        <CommandList>
          <CommandEmpty>{t("commandEmpty")}</CommandEmpty>
          {recent.length > 0 ? (
            <CommandGroup heading={t("commandRecent")}>
              {recent.map((item) => (
                <CommandItem
                  key={`${item.projectId}:${item.section}`}
                  value={`${t("commandRecent")} ${labelFor(item.section)}`}
                  onSelect={() => {
                    closeAndGo(sectionHref(item.projectId, item.section));
                  }}
                >
                  {labelFor(item.section)}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {projectId ? (
            <CommandGroup heading={t("commandActions")}>
              <CommandItem
                value={t("commandAddData")}
                onSelect={() => {
                  closeAndGo(sectionHref(projectId, "data"));
                }}
              >
                {t("commandAddData")}
              </CommandItem>
              <CommandItem
                value={t("commandCompile")}
                onSelect={() => {
                  closeAndGo(sectionHref(projectId, "compile"));
                }}
              >
                {t("commandCompile")}
              </CommandItem>
            </CommandGroup>
          ) : null}
          {projectId ? (
            <CommandGroup heading={t("commandNavigation")}>
              {workspaceNav.map((item) => (
                <CommandItem
                  key={item.section}
                  value={t(item.labelKey)}
                  onSelect={() => {
                    closeAndGo(sectionHref(projectId, item.section));
                  }}
                >
                  <item.icon />
                  {t(item.labelKey)}
                </CommandItem>
              ))}
              <CommandItem
                value={t("openInspector")}
                onSelect={() => {
                  openInspector({
                    title: t("inspectorTitle"),
                    detail: t("inspectorEmpty"),
                  });
                  setCommandOpen(false);
                  setQuery("");
                }}
              >
                {t("openInspector")}
              </CommandItem>
            </CommandGroup>
          ) : null}
          <CommandSeparator />
          <CommandGroup heading={t("commandProjects")}>
            {projectsQuery.data?.map((project) => (
              <CommandItem
                key={project.id}
                value={project.name}
                onSelect={() => {
                  closeAndGo(sectionHref(project.id, "overview"));
                }}
              >
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
          {projectId && deferredQuery.length === 0 && graphQuery.data ? (
            <CommandGroup heading={t("commandObjects")}>
              {graphQuery.data.nodes.slice(0, 6).map((node) => (
                <CommandItem
                  key={node.id}
                  value={node.label}
                  onSelect={() => {
                    closeAndGo(morphologyObjectHref(projectId, node.id));
                  }}
                >
                  {node.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {searchQuery.data && searchQuery.data.length > 0 ? (
            <CommandGroup heading={t("commandObjects")}>
              {searchQuery.data.map((hit) => (
                <CommandItem
                  key={hit.id}
                  value={hit.label}
                  onSelect={() => {
                    if (!projectId) {
                      return;
                    }

                    closeAndGo(morphologyObjectHref(projectId, hit.id));
                  }}
                >
                  {hit.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
