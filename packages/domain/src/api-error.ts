import { z } from "zod";

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  status: z.number().int().optional(),
  message: z.string().optional(),
  details: z.unknown().optional(),
  requestId: z.string().min(1).optional(),
  retryable: z.boolean(),
});

export type ElmorfApiErrorBody = z.infer<typeof ApiErrorSchema>;
