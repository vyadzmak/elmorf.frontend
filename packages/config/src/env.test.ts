import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";

describe("parsePublicEnv", () => {
  it("applies development defaults when values are missing", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_APP_ENV: undefined,
        NEXT_PUBLIC_MOCK_MODE: undefined,
        NEXT_PUBLIC_API_BASE_URL: undefined,
        NEXT_PUBLIC_SITE_URL: undefined,
        NEXT_PUBLIC_APP_URL: undefined,
      }),
    ).toEqual({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_MOCK_MODE: "true",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3001",
      NEXT_PUBLIC_APP_URL: "http://localhost:3002",
    });
  });

  it("fails fast on an invalid environment value", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_APP_ENV: "staging",
        NEXT_PUBLIC_MOCK_MODE: "true",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
        NEXT_PUBLIC_SITE_URL: undefined,
        NEXT_PUBLIC_APP_URL: undefined,
      }),
    ).toThrow(/Invalid environment/);
  });
});
