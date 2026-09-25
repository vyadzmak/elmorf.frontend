import { z } from "zod";

export const ModelSummarySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  version: z.string().min(1),
  createdAt: z.iso.datetime(),
  sourceCount: z.number().int().nonnegative(),
  objectCount: z.number().int().nonnegative(),
  relationCount: z.number().int().nonnegative(),
  conflictCount: z.number().int().nonnegative(),
});

export type ModelSummary = z.infer<typeof ModelSummarySchema>;
