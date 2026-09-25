import { Suspense } from "react";
import { QueryWorkbench } from "@/features/query/query-workbench";

export default async function QueryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={null}>
      <QueryWorkbench projectId={projectId} />
    </Suspense>
  );
}
