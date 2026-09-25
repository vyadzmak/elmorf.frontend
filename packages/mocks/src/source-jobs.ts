import { SourceSchema, type Source, type SourceProcessing } from "@elmorf/domain";

const QUEUED_MS = 700;
const UPLOAD_MS = 900;
const STAGE_MS = 1_100;
const STAGES = ["extract", "normalize", "index"] as const;

export const SOURCE_JOB_DONE_MS = QUEUED_MS + UPLOAD_MS + STAGE_MS * STAGES.length;

interface SourceJob {
  startedAt: number;
  fail: boolean;
}

const jobs = new Map<string, SourceJob>();

export function clearSourceJobs(): void {
  jobs.clear();
}

export function beginSourceJob(id: string, now: number, fail: boolean): void {
  jobs.set(id, { startedAt: now, fail });
}

export function forgetSourceJob(id: string): void {
  jobs.delete(id);
}

function roundProgress(value: number): number {
  return Math.round(Math.min(0.99, Math.max(0, value)) * 100) / 100;
}

function processingEqual(left: SourceProcessing, right: SourceProcessing): boolean {
  if (left.status !== right.status) {
    return false;
  }

  if (left.status === "processing" && right.status === "processing") {
    return left.stage === right.stage && left.progress === right.progress;
  }

  if (left.status === "uploading" && right.status === "uploading") {
    return left.progress === right.progress;
  }

  if (left.status === "ready" && right.status === "ready") {
    return left.completedAt === right.completedAt;
  }

  if (left.status === "failed" && right.status === "failed") {
    return left.error.code === right.error.code && left.error.message === right.error.message;
  }

  if (left.status === "cancelled" && right.status === "cancelled") {
    return left.cancelledAt === right.cancelledAt;
  }

  return true;
}

function projectJob(source: Source, job: SourceJob, now: number): Source {
  const elapsed = Math.max(0, now - job.startedAt);
  let processing: SourceProcessing;

  if (elapsed < QUEUED_MS) {
    processing = { status: "queued" };
  } else if (elapsed < QUEUED_MS + UPLOAD_MS) {
    processing = {
      status: "uploading",
      progress: roundProgress((elapsed - QUEUED_MS) / UPLOAD_MS),
    };
  } else {
    const stageElapsed = elapsed - QUEUED_MS - UPLOAD_MS;
    const stageIndex = Math.floor(stageElapsed / STAGE_MS);
    const stage = STAGES[stageIndex];
    if (!stage) {
      processing = job.fail
        ? {
            status: "failed",
            error: {
              code: "source_unreadable",
              message: "The file could not be read.",
              retryable: true,
            },
          }
        : {
            status: "ready",
            completedAt: new Date(now).toISOString(),
          };
    } else {
      processing = {
        status: "processing",
        stage,
        progress: roundProgress((stageElapsed % STAGE_MS) / STAGE_MS),
      };
    }
  }

  if (processingEqual(source.processing, processing)) {
    return source;
  }

  return SourceSchema.parse({ ...source, processing });
}

export function advanceSourceJobs(sources: Source[], now: number): Source[] {
  if (jobs.size === 0) {
    return sources;
  }

  let changed = false;
  const next = sources.map((source) => {
    const job = jobs.get(source.id);
    if (!job) {
      return source;
    }

    const projected = projectJob(source, job, now);
    if (
      projected.processing.status === "ready" ||
      projected.processing.status === "failed"
    ) {
      jobs.delete(source.id);
    }

    if (projected !== source) {
      changed = true;
    }

    return projected;
  });

  return changed ? next : sources;
}

export function isActiveSource(source: Source): boolean {
  const status = source.processing.status;
  return status === "queued" || status === "uploading" || status === "processing";
}
