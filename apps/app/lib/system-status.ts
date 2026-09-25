import type { Compilation, Source } from "@elmorf/domain";

export type SystemTone = "ready" | "processing" | "compiling" | "attention";

export interface SystemStatus {
  tone: SystemTone;
  processingCount: number;
  failedSourceCount: number;
  compilationStatus: Compilation["state"]["status"] | "none";
  compilationId: string | null;
  compilationVersion: string | null;
}

const activeSourceStatuses = new Set(["queued", "uploading", "processing"]);

export function deriveSystemStatus(
  sources: Source[],
  compilation: Compilation | null,
): SystemStatus {
  const processingCount = sources.filter((source) =>
    activeSourceStatuses.has(source.processing.status),
  ).length;
  const failedSourceCount = sources.filter(
    (source) => source.processing.status === "failed",
  ).length;
  const compilationStatus = compilation?.state.status ?? "none";
  const compiling =
    compilationStatus === "queued" || compilationStatus === "running";

  let tone: SystemTone = "ready";
  if (compiling) {
    tone = "compiling";
  } else if (processingCount > 0) {
    tone = "processing";
  } else if (failedSourceCount > 0 || compilationStatus === "failed") {
    tone = "attention";
  }

  return {
    tone,
    processingCount,
    failedSourceCount,
    compilationStatus,
    compilationId: compilation?.id ?? null,
    compilationVersion: compilation?.version ?? null,
  };
}
