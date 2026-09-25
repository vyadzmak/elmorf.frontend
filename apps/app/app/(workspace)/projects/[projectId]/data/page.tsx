import { Suspense } from "react";
import { DataWorkbench } from "@/features/data/data-workbench";

export default async function DataPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={null}>
      <DataWorkbench projectId={projectId} />
    </Suspense>
  );
}
