import { z } from "zod";

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const SignUpInputSchema = SignInInputSchema.extend({
  name: z.string().min(1),
});

export const PasswordResetInputSchema = z.object({
  email: z.email(),
});

export const PasswordResetResultSchema = z.object({
  accepted: z.literal(true),
});

export const SessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
});

export const SessionSchema = z.object({
  user: SessionUserSchema,
});

export const SessionResponseSchema = z.object({
  session: SessionSchema.nullable(),
});

export const AuthResultSchema = z.object({
  session: SessionSchema,
});

export type SignInInput = z.infer<typeof SignInInputSchema>;
export type SignUpInput = z.infer<typeof SignUpInputSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetInputSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type AuthResult = z.infer<typeof AuthResultSchema>;
