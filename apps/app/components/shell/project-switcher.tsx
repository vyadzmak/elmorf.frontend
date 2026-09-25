"use client";

import { projectListOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@elmorf/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@elmorf/ui/components/ui/popover";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useCloseMobileSidebar } from "@/components/shell/use-close-mobile-sidebar";
import { useApiClient } from "@/lib/use-api";
import { sectionFromPath, sectionHref } from "@/lib/workspace-path";

export function ProjectSwitcher({
  projectId,
  projectName,
}: {
  projectId: string | null;
  projectName: string | null;
}) {
  const t = useTranslations("Shell");
  const router = useRouter();
  const pathname = usePathname();
  const ready = useMockReady();
  const api = useApiClient();
  const [open, setOpen] = useState(false);
  const closeMobileSidebar = useCloseMobileSidebar();
  const projectsQuery = useQuery({
    ...projectListOptions(api),
    enabled: ready,
  });

  function openProject(nextProjectId: string) {
    const section = sectionFromPath(pathname) ?? "overview";
    setOpen(false);
    closeMobileSidebar();
    router.push(sectionHref(nextProjectId, section));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-full justify-between px-2 font-normal"
          aria-label={t("switchProject")}
        >
          {projectName ? (
            <span className="truncate">{projectName}</span>
          ) : projectId ? (
            <Skeleton className="h-3 w-24" />
          ) : (
            <span className="truncate text-muted-foreground">{t("switchProject")}</span>
          )}
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t("projectSearch")} />
          <CommandList>
            <CommandEmpty>{t("projectEmpty")}</CommandEmpty>
            <CommandGroup>
              {projectsQuery.data?.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    openProject(project.id);
                  }}
                >
                  <span className="truncate">{project.name}</span>
                  {project.id === projectId ? <Check className="ms-auto size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value={t("createProject")}
                onSelect={() => {
                  setOpen(false);
                  closeMobileSidebar();
                  router.push("/projects/new");
                }}
              >
                <Plus className="size-4" />
                {t("createProject")}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
