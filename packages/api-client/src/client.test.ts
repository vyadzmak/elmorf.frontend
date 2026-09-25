import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createApiClient } from "./client";
import { ElmorfApiError } from "./error";

function readSourceTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return [readSourceTree(entryPath)];
      }

      if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
        return [];
      }

      return [readFileSync(entryPath, "utf8")];
    })
    .join("\n");
}

describe("api client", () => {
  it("does not know the fixture implementation", () => {
    const source = readSourceTree(path.join(process.cwd(), "src"));
    expect(source).not.toContain("@elmorf/mocks");
  });

  it("normalizes an unauthorized response", async () => {
    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      fetchFn: async () =>
        new Response(
          JSON.stringify({
            code: "unauthorized",
            retryable: false,
          }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          },
        ),
    });

    await expect(client.projects.list()).rejects.toMatchObject({
      name: "ElmorfApiError",
      code: "unauthorized",
      status: 401,
      retryable: false,
    });
    await expect(client.projects.list()).rejects.toBeInstanceOf(ElmorfApiError);
  });

  it("rejects a payload that misses the schema", async () => {
    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      fetchFn: async () =>
        new Response(JSON.stringify({ projects: [{ id: "" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });

    await expect(client.projects.list()).rejects.toMatchObject({
      code: "invalid_response",
      retryable: false,
    });
  });
});
