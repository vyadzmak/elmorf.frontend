import { z } from "zod";

export const ObjectTypeSchema = z.enum([
  "company",
  "person",
  "contract",
  "invoice",
  "address",
  "product",
]);

export const RelationTypeSchema = z.enum([
  "SIGNED",
  "WORKS_FOR",
  "BELONGS_TO",
  "SUPPLIES",
  "LOCATED_AT",
]);

export const ObjectAttributeSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const EvidenceSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  excerpt: z.string(),
});

export const ConflictSchema = z.object({
  id: z.string().min(1),
  objectId: z.string().min(1),
  summary: z.string().min(1),
});

export const CompiledObjectSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  modelVersionId: z.string().min(1),
  type: ObjectTypeSchema,
  label: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  attributes: z.array(ObjectAttributeSchema),
  conflictCount: z.number().int().nonnegative(),
});

export const RelationSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  modelVersionId: z.string().min(1),
  type: RelationTypeSchema,
  sourceObjectId: z.string().min(1),
  targetObjectId: z.string().min(1),
  directed: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
});

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  conflictCount: z.number().int().nonnegative().optional(),
  metrics: z
    .object({
      degree: z.number().optional(),
      centrality: z.number().optional(),
    })
    .optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.string().min(1),
  directed: z.boolean(),
  confidence: z.number().min(0).max(1).optional(),
});

export const ObjectSearchHitSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  type: ObjectTypeSchema,
  label: z.string().min(1),
});

export const ObjectSearchResponseSchema = z.object({
  objects: z.array(ObjectSearchHitSchema).max(8),
});

export const GraphResponseSchema = z.object({
  modelVersion: z.string().min(1),
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  meta: z.object({
    totalNodes: z.number().int().nonnegative(),
    totalEdges: z.number().int().nonnegative(),
    truncated: z.boolean(),
  }),
});

export const ObjectDetailSchema = CompiledObjectSchema.extend({
  evidence: z.array(EvidenceSchema),
  conflicts: z.array(ConflictSchema),
});

export const RelationDetailSchema = RelationSchema.extend({
  sourceLabel: z.string().min(1),
  targetLabel: z.string().min(1),
  evidence: z.array(EvidenceSchema),
});

export type ObjectType = z.infer<typeof ObjectTypeSchema>;
export type RelationType = z.infer<typeof RelationTypeSchema>;
export type ObjectAttribute = z.infer<typeof ObjectAttributeSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Conflict = z.infer<typeof ConflictSchema>;
export type CompiledObject = z.infer<typeof CompiledObjectSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type ObjectSearchHit = z.infer<typeof ObjectSearchHitSchema>;
export type ObjectDetail = z.infer<typeof ObjectDetailSchema>;
export type RelationDetail = z.infer<typeof RelationDetailSchema>;
export type GraphResponse = z.infer<typeof GraphResponseSchema>;
