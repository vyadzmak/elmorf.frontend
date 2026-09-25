import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { OverviewPage } from "@/features/overview/overview-page";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const shell = await getTranslations("Shell");

  return (
    <WorkspacePage title={shell("navOverview")}>
      <Suspense fallback={null}>
        <OverviewPage projectId={projectId} />
      </Suspense>
    </WorkspacePage>
  );
}
