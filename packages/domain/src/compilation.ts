import { z } from "zod";
import { ApiErrorSchema } from "./api-error";

export const CompilationStageNameSchema = z.enum(["bones", "flesh", "compile"]);

export const CompilationStageStateSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
]);

export const CompilationStageSchema = z.object({
  name: CompilationStageNameSchema,
  state: CompilationStageStateSchema,
  elapsedMs: z.number().int().nonnegative().optional(),
  warningCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
});

export const CompilationStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("queued") }),
  z.object({
    status: z.literal("running"),
    stage: CompilationStageNameSchema,
    progress: z.number().min(0).max(1).optional(),
  }),
  z.object({
    status: z.literal("completed"),
    completedAt: z.iso.datetime(),
    modelVersionId: z.string().min(1),
  }),
  z.object({
    status: z.literal("failed"),
    error: ApiErrorSchema,
  }),
  z.object({
    status: z.literal("cancelled"),
    cancelledAt: z.iso.datetime(),
  }),
]);

export const CompilationLogLevelSchema = z.enum(["info", "warning", "error"]);

export const CompilationLogEntrySchema = z.object({
  id: z.string().min(1),
  timestamp: z.iso.datetime(),
  level: CompilationLogLevelSchema,
  stage: CompilationStageNameSchema,
  message: z.string().min(1),
});

export const CompilationSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  version: z.string().min(1),
  startedAt: z.iso.datetime(),
  stages: z.array(CompilationStageSchema),
  state: CompilationStateSchema,
});

export type CompilationStageName = z.infer<typeof CompilationStageNameSchema>;
export type CompilationStage = z.infer<typeof CompilationStageSchema>;
export type CompilationState = z.infer<typeof CompilationStateSchema>;
export type CompilationLogLevel = z.infer<typeof CompilationLogLevelSchema>;
export type CompilationLogEntry = z.infer<typeof CompilationLogEntrySchema>;
export type Compilation = z.infer<typeof CompilationSchema>;
