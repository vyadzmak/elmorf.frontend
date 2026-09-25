import { z } from "zod";
import { ApiErrorSchema } from "./api-error";

export const SourceKindSchema = z.enum(["pdf", "csv", "xlsx", "docx", "zip"]);

export const SOURCE_MAX_FILES = 20;
export const SOURCE_MAX_BYTES = 100 * 1024 * 1024;

export function sourceKindFromName(name: string): z.infer<typeof SourceKindSchema> | null {
  const trimmed = name.trim().toLowerCase();
  const extension = trimmed.includes(".") ? trimmed.split(".").pop() ?? "" : "";
  const parsed = SourceKindSchema.safeParse(extension);
  return parsed.success ? parsed.data : null;
}

export const ProcessingStageSchema = z.enum(["extract", "normalize", "index"]);

export const SourceProcessingSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("queued") }),
  z.object({
    status: z.literal("uploading"),
    progress: z.number().min(0).max(1).optional(),
  }),
  z.object({
    status: z.literal("processing"),
    stage: ProcessingStageSchema,
    progress: z.number().min(0).max(1).optional(),
  }),
  z.object({
    status: z.literal("ready"),
    completedAt: z.iso.datetime(),
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

export const SourceSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  kind: SourceKindSchema,
  sizeBytes: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  processing: SourceProcessingSchema,
});

export const CreateSourceFileSchema = z.object({
  name: z.string().min(1).max(240),
  kind: SourceKindSchema,
  sizeBytes: z.number().int().nonnegative(),
});

export const CreateSourcesInputSchema = z.object({
  files: z.array(CreateSourceFileSchema).min(1).max(SOURCE_MAX_FILES),
});

export type SourceKind = z.infer<typeof SourceKindSchema>;
export type ProcessingStage = z.infer<typeof ProcessingStageSchema>;
export type SourceProcessing = z.infer<typeof SourceProcessingSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type CreateSourcesInput = z.infer<typeof CreateSourcesInputSchema>;
