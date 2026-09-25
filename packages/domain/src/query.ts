import { z } from "zod";
import { ApiErrorSchema } from "./api-error";
import { CompiledObjectSchema, EvidenceSchema, GraphResponseSchema } from "./morphology";

export const QueryLanguageSchema = z.enum(["natural", "structured"]);

export const QueryRequestSchema = z.object({
  projectId: z.string().min(1),
  text: z.string().min(1),
  language: QueryLanguageSchema,
});

export const QueryResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("json"),
    value: z.unknown(),
  }),
  z.object({
    kind: z.literal("table"),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  z.object({
    kind: z.literal("object"),
    object: CompiledObjectSchema,
  }),
  z.object({
    kind: z.literal("graph"),
    graph: GraphResponseSchema,
  }),
  z.object({
    kind: z.literal("empty"),
  }),
]);

export const QueryExecutionStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("queued") }),
  z.object({ status: z.literal("running") }),
  z.object({
    status: z.literal("completed"),
    completedAt: z.iso.datetime(),
    elapsedMs: z.number().int().nonnegative(),
    modelVersion: z.string().min(1),
    evidence: z.array(EvidenceSchema),
    result: QueryResultSchema,
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

export const QueryExecutionSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  text: z.string().min(1),
  language: QueryLanguageSchema,
  state: QueryExecutionStateSchema,
});

export type QueryLanguage = z.infer<typeof QueryLanguageSchema>;
export type QueryRequest = z.infer<typeof QueryRequestSchema>;
export type QueryResult = z.infer<typeof QueryResultSchema>;
export type QueryExecution = z.infer<typeof QueryExecutionSchema>;
