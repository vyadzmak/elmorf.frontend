import { z } from "zod";

const httpUrl = z
  .string()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "NEXT_PUBLIC_API_BASE_URL must be an http(s) URL");

export const PublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_MOCK_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_API_BASE_URL: httpUrl.default("http://localhost:4000"),
  NEXT_PUBLIC_SITE_URL: httpUrl.default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: httpUrl.default("http://localhost:3002"),
});

export interface PublicEnv {
  NEXT_PUBLIC_APP_ENV: "development" | "test" | "production";
  NEXT_PUBLIC_MOCK_MODE: "true" | "false";
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_APP_URL: string;
}

export interface PublicEnvInput {
  NEXT_PUBLIC_APP_ENV: string | undefined;
  NEXT_PUBLIC_MOCK_MODE: string | undefined;
  NEXT_PUBLIC_API_BASE_URL: string | undefined;
  NEXT_PUBLIC_SITE_URL: string | undefined;
  NEXT_PUBLIC_APP_URL: string | undefined;
}

export function readPublicEnvInput(
  source: NodeJS.ProcessEnv = process.env,
): PublicEnvInput {
  return {
    NEXT_PUBLIC_APP_ENV: source.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_MOCK_MODE: source.NEXT_PUBLIC_MOCK_MODE,
    NEXT_PUBLIC_API_BASE_URL: source.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
  };
}

export function parsePublicEnv(input: PublicEnvInput = readPublicEnvInput()): PublicEnv {
  const result = PublicEnvSchema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join("\n");
    throw new Error(`Invalid environment:\n${message}`);
  }

  return result.data;
}
