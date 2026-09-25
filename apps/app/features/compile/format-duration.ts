import type { Compilation } from "@elmorf/domain";

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

export function compilationDurationMs(compilation: Compilation, now: number): number | null {
  if (compilation.state.status === "completed") {
    return Date.parse(compilation.state.completedAt) - Date.parse(compilation.startedAt);
  }

  if (compilation.state.status === "cancelled") {
    return Date.parse(compilation.state.cancelledAt) - Date.parse(compilation.startedAt);
  }

  if (compilation.state.status === "failed") {
    const elapsed = compilation.stages.reduce((sum, stage) => sum + (stage.elapsedMs ?? 0), 0);
    return elapsed > 0 ? elapsed : null;
  }

  if (compilation.state.status === "queued" || compilation.state.status === "running") {
    return Math.max(0, now - Date.parse(compilation.startedAt));
  }

  return null;
}
