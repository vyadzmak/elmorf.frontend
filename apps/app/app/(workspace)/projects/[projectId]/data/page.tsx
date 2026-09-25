import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { DataWorkbench } from "@/features/data/data-workbench";

export default async function DataPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <DataWorkbench projectId={projectId} />
    </Suspense>
  );
}
