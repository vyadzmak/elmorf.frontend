import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { QueryWorkbench } from "@/features/query/query-workbench";

export default async function QueryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <QueryWorkbench projectId={projectId} />
    </Suspense>
  );
}
