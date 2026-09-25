import { z } from "zod";

export const ProjectCapabilitiesSchema = z.object({
  canAddData: z.boolean(),
  canCompile: z.boolean(),
  canManageApiKeys: z.boolean(),
  canDeleteProject: z.boolean(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capabilities: ProjectCapabilitiesSchema,
  currentModelVersionId: z.string().min(1).nullable(),
});

export type ProjectCapabilities = z.infer<typeof ProjectCapabilitiesSchema>;
export type Project = z.infer<typeof ProjectSchema>;
