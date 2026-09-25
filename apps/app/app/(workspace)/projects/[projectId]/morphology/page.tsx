import { Suspense } from "react";
import { MorphologyWorkbench } from "@/features/morphology/morphology-workbench";

export default async function MorphologyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={null}>
      <MorphologyWorkbench projectId={projectId} />
    </Suspense>
  );
}
