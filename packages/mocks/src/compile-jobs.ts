import {
  CompilationLogEntrySchema,
  CompilationSchema,
  ModelSummarySchema,
  type Compilation,
  type CompilationLogEntry,
  type CompilationStage,
  type CompilationStageName,
  type ModelSummary,
} from "@elmorf/domain";

const QUEUED_MS = 600;
const STAGE_MS = 1_400;
const STAGE_NAMES = ["bones", "flesh", "compile"] as const;
const SUCCESS_PATH = [
  "queued",
  "running:bones",
  "running:flesh",
  "running:compile",
  "completed",
] as const;
const FAIL_PATH = ["queued", "running:bones", "running:flesh", "failed"] as const;

export const COMPILE_JOB_DONE_MS = QUEUED_MS + STAGE_MS * STAGE_NAMES.length;

interface CompileJob {
  startedAt: number;
  failAtFlesh: boolean;
  sourceCount: number;
  objectCount: number;
  relationCount: number;
  conflictCount: number;
  loggedStep: string;
}

export interface CompileJobStart {
  id: string;
  startedAt: number;
  failAtFlesh: boolean;
  sourceCount: number;
  objectCount: number;
  relationCount: number;
  conflictCount: number;
}

export interface CompilationAdvance {
  compilations: Compilation[];
  model: ModelSummary | null;
}

const jobs = new Map<string, CompileJob>();
const logs = new Map<string, CompilationLogEntry[]>();

export function clearCompileJobs(): void {
  jobs.clear();
  logs.clear();
}

export function beginCompileJob(start: CompileJobStart): void {
  jobs.set(start.id, {
    startedAt: start.startedAt,
    failAtFlesh: start.failAtFlesh,
    sourceCount: start.sourceCount,
    objectCount: start.objectCount,
    relationCount: start.relationCount,
    conflictCount: start.conflictCount,
    loggedStep: "",
  });
}

export function forgetCompileJob(id: string): void {
  jobs.delete(id);
}

export function compilationLogs(id: string): CompilationLogEntry[] {
  return [...(logs.get(id) ?? [])];
}

export function nextCompilationVersion(compilations: Compilation[]): string {
  let max = 0;
  for (const compilation of compilations) {
    const match = /^v(\d+)$/.exec(compilation.version);
    if (match?.[1]) {
      max = Math.max(max, Number(match[1]));
    }
  }

  return `v${max + 1}`;
}

export function seedFixtureCompilationLogs(compilations: Compilation[]): void {
  for (const compilation of compilations) {
    if (compilation.state.status !== "completed" || logs.has(compilation.id)) {
      continue;
    }

    const at = Date.parse(compilation.state.completedAt);
    logs.set(compilation.id, [
      logEntry(compilation.id, 0, at - 3_000, "info", "bones", "Bones built from ready sources."),
      logEntry(compilation.id, 1, at - 2_000, "info", "flesh", "Relations normalized."),
      logEntry(compilation.id, 2, at - 1_000, "warning", "flesh", "Dropped an empty attribute."),
      logEntry(
        compilation.id,
        3,
        at,
        "info",
        "compile",
        `Model ${compilation.version} written.`,
      ),
    ]);
  }
}

export function appendCancellationLog(compilation: Compilation, now: number): void {
  const stage =
    compilation.stages.find((item) => item.state === "running")?.name ?? "bones";
  const existing = logs.get(compilation.id) ?? [];
  logs.set(compilation.id, [
    ...existing,
    logEntry(
      compilation.id,
      existing.length,
      now,
      "info",
      stage,
      "Compilation cancelled.",
    ),
  ]);
}

export function advanceCompilationJobs(
  compilations: Compilation[],
  now: number,
): CompilationAdvance {
  if (jobs.size === 0) {
    return { compilations, model: null };
  }

  let model: ModelSummary | null = null;
  let changed = false;
  const next = compilations.map((compilation) => {
    const job = jobs.get(compilation.id);
    if (!job) {
      return compilation;
    }

    const projected = projectJob(compilation, job, now);
    absorbLogs(projected, job);
    if (projected.state.status === "completed") {
      model = finishedModel(projected, job);
      jobs.delete(compilation.id);
    } else if (projected.state.status === "failed") {
      jobs.delete(compilation.id);
    }

    changed = true;
    return projected;
  });

  if (!changed) {
    return { compilations, model: null };
  }

  return { compilations: next, model };
}

function finishedModel(compilation: Compilation, job: CompileJob): ModelSummary {
  if (compilation.state.status !== "completed") {
    throw new Error("A finished compilation model requires a completed job.");
  }

  return ModelSummarySchema.parse({
    id: compilation.state.modelVersionId,
    projectId: compilation.projectId,
    version: compilation.version,
    createdAt: compilation.state.completedAt,
    sourceCount: job.sourceCount,
    objectCount: job.objectCount,
    relationCount: job.relationCount,
    conflictCount: job.conflictCount,
  });
}

function projectJob(compilation: Compilation, job: CompileJob, now: number): Compilation {
  const elapsed = Math.max(0, now - job.startedAt);
  if (elapsed < QUEUED_MS) {
    return CompilationSchema.parse({
      ...compilation,
      stages: STAGE_NAMES.map((name) => stage(name, "pending", undefined, 0, 0)),
      state: { status: "queued" },
    });
  }

  const stageIndex = Math.floor((elapsed - QUEUED_MS) / STAGE_MS);
  if (job.failAtFlesh && stageIndex >= 2) {
    return CompilationSchema.parse({
      ...compilation,
      stages: [
        stage("bones", "completed", STAGE_MS, 0, 0),
        stage("flesh", "failed", STAGE_MS, 0, 1),
        stage("compile", "pending", undefined, 0, 0),
      ],
      state: {
        status: "failed",
        error: {
          code: "compile_failed",
          message: "Flesh processing stopped.",
          retryable: true,
        },
      },
    });
  }

  if (stageIndex >= STAGE_NAMES.length) {
    return CompilationSchema.parse({
      ...compilation,
      stages: STAGE_NAMES.map((name) =>
        stage(name, "completed", STAGE_MS, name === "flesh" ? 1 : 0, 0),
      ),
      state: {
        status: "completed",
        completedAt: new Date(now).toISOString(),
        modelVersionId: `mdl_${compilation.version}`,
      },
    });
  }

  const active = STAGE_NAMES[stageIndex] ?? "bones";
  const within = Math.min(STAGE_MS - 1, elapsed - QUEUED_MS - stageIndex * STAGE_MS);
  return CompilationSchema.parse({
    ...compilation,
    stages: STAGE_NAMES.map((name, index) => {
      if (index < stageIndex) {
        return stage(name, "completed", STAGE_MS, 0, 0);
      }
      if (index === stageIndex) {
        return stage(name, "running", within, 0, 0);
      }
      return stage(name, "pending", undefined, 0, 0);
    }),
    state: {
      status: "running",
      stage: active,
      progress: Math.round(Math.min(0.99, within / STAGE_MS) * 100) / 100,
    },
  });
}

function stage(
  name: CompilationStageName,
  state: CompilationStage["state"],
  elapsedMs: number | undefined,
  warningCount: number,
  errorCount: number,
): CompilationStage {
  return {
    name,
    state,
    warningCount,
    errorCount,
    ...(elapsedMs === undefined ? {} : { elapsedMs }),
  };
}

function absorbLogs(compilation: Compilation, job: CompileJob): void {
  const path: readonly string[] = job.failAtFlesh ? FAIL_PATH : SUCCESS_PATH;
  const step = stepOf(compilation);
  const target = path.indexOf(step);
  if (target < 0) {
    return;
  }

  const from = job.loggedStep ? path.indexOf(job.loggedStep) + 1 : 0;
  if (from > target) {
    return;
  }

  const existing = logs.get(compilation.id) ?? [];
  const next = [...existing];
  for (let index = from; index <= target; index += 1) {
    const name = path[index];
    if (!name) {
      continue;
    }

    const at = stamp(job.startedAt, name);
    const lines = messages(name, compilation.version);
    lines.forEach((line, lineIndex) => {
      next.push(
        logEntry(
          compilation.id,
          next.length,
          at + lineIndex,
          line.level,
          line.stage,
          line.message,
        ),
      );
    });
  }

  job.loggedStep = step;
  logs.set(compilation.id, next);
}

function stepOf(compilation: Compilation): string {
  if (compilation.state.status === "running") {
    return `running:${compilation.state.stage}`;
  }

  return compilation.state.status;
}

function stamp(startedAt: number, step: string): number {
  if (step === "queued") {
    return startedAt;
  }
  if (step === "running:bones") {
    return startedAt + QUEUED_MS;
  }
  if (step === "running:flesh") {
    return startedAt + QUEUED_MS + STAGE_MS;
  }
  if (step === "running:compile") {
    return startedAt + QUEUED_MS + STAGE_MS * 2;
  }
  if (step === "failed") {
    return startedAt + QUEUED_MS + STAGE_MS * 2;
  }

  return startedAt + COMPILE_JOB_DONE_MS;
}

function messages(
  step: string,
  version: string,
): Array<{ level: CompilationLogEntry["level"]; stage: CompilationStageName; message: string }> {
  if (step === "queued") {
    return [{ level: "info", stage: "bones", message: "Compilation queued." }];
  }
  if (step === "running:bones") {
    return [{ level: "info", stage: "bones", message: "Bones started." }];
  }
  if (step === "running:flesh") {
    return [
      { level: "info", stage: "bones", message: "Bones completed." },
      { level: "info", stage: "flesh", message: "Flesh started." },
    ];
  }
  if (step === "running:compile") {
    return [
      { level: "info", stage: "flesh", message: "Flesh completed." },
      { level: "warning", stage: "flesh", message: "Dropped an empty attribute." },
      { level: "info", stage: "compile", message: "Compile started." },
    ];
  }
  if (step === "completed") {
    return [{ level: "info", stage: "compile", message: `Model ${version} written.` }];
  }
  if (step === "failed") {
    return [{ level: "error", stage: "flesh", message: "Flesh processing stopped." }];
  }

  return [];
}

function logEntry(
  compilationId: string,
  index: number,
  at: number,
  level: CompilationLogEntry["level"],
  stageName: CompilationStageName,
  message: string,
): CompilationLogEntry {
  return CompilationLogEntrySchema.parse({
    id: `${compilationId}:${index}`,
    timestamp: new Date(at).toISOString(),
    level,
    stage: stageName,
    message,
  });
}
