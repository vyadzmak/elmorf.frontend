import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function flatten(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalogs", () => {
  it("keeps English and Russian keys aligned", () => {
    const directory = path.join(import.meta.dirname, "../messages");
    const english = JSON.parse(readFileSync(path.join(directory, "en/common.json"), "utf8")) as unknown;
    const russian = JSON.parse(readFileSync(path.join(directory, "ru/common.json"), "utf8")) as unknown;
    expect(flatten(russian).sort()).toEqual(flatten(english).sort());
  });
});
