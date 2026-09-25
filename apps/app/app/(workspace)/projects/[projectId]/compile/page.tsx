import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { CompileWorkbench } from "@/features/compile/compile-workbench";

export default async function CompilePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<WorkspaceRouteSkeleton />}>
      <CompileWorkbench projectId={projectId} />
    </Suspense>
  );
}
