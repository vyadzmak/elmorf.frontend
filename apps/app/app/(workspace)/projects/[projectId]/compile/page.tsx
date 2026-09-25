import { Suspense } from "react";
import { CompileWorkbench } from "@/features/compile/compile-workbench";

export default async function CompilePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={null}>
      <CompileWorkbench projectId={projectId} />
    </Suspense>
  );
}
