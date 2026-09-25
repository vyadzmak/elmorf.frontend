import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { MorphologyWorkbench } from "@/features/morphology/morphology-workbench";

export default async function MorphologyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <MorphologyWorkbench projectId={projectId} />
    </Suspense>
  );
}
