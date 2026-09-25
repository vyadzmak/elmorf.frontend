import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { OverviewPage } from "@/features/overview/overview-page";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const shell = await getTranslations("Shell");
  const overview = await getTranslations("Overview");

  return (
    <WorkspacePage title={shell("navOverview")} description={overview("pageDescription")}>
      <Suspense fallback={<WorkspaceRouteSkeleton />}>
        <OverviewPage projectId={projectId} />
      </Suspense>
    </WorkspacePage>
  );
}
