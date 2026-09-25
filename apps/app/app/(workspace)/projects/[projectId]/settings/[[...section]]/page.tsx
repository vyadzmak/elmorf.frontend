import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { ProjectSettings } from "@/features/settings/project-settings";
import { SettingsFrame } from "@/features/settings/settings-frame";
import { settingsSectionFromPath } from "@/features/settings/settings-section-id";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string; section?: string[] }>;
}) {
  const { projectId, section } = await params;
  const shell = await getTranslations("Shell");
  const active = settingsSectionFromPath(section?.[0]);

  return (
    <WorkspacePage title={shell("navSettings")}>
      <SettingsFrame active={active}>
        <Suspense fallback={<WorkspaceRouteSkeleton />}>
          <ProjectSettings projectId={projectId} section={active} />
        </Suspense>
      </SettingsFrame>
    </WorkspacePage>
  );
}
