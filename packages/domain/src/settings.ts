import { z } from "zod";

export const ApiKeySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  prefix: z.string().min(1),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime().optional(),
});

export const ApiKeyCreatedSchema = ApiKeySchema.extend({
  secret: z.string().min(1),
});

export const CreateApiKeyInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  locale: z.enum(["en", "ru"]),
});

export const UpdatePreferencesSchema = UserPreferencesSchema.partial();

export type ApiKey = z.infer<typeof ApiKeySchema>;
export type ApiKeyCreated = z.infer<typeof ApiKeyCreatedSchema>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UpdatePreferences = z.infer<typeof UpdatePreferencesSchema>;
