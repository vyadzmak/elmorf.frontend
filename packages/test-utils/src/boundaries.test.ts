import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const ignored = new Set(["node_modules", ".next", "dist", "storybook-static", "coverage"]);

function filesUnder(directory: string, extension: RegExp): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) {
      continue;
    }
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...filesUnder(full, extension));
    } else if (extension.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

function sourceFiles(root: string): string[] {
  return filesUnder(root, /\.(ts|tsx)$/).filter((file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"));
}

describe("product boundaries", () => {
  it("keeps Base UI, fixture imports, and raw hex out of feature code", () => {
    const appFiles = sourceFiles(path.join(repoRoot, "apps"));
    const featureViews = appFiles.filter((file) => file.endsWith(".tsx"));
    const violations: string[] = [];

    for (const file of appFiles) {
      const source = readFileSync(file, "utf8");
      const relative = path.relative(repoRoot, file);
      if (source.includes("@base-ui")) {
        violations.push(`${relative} imports Base UI`);
      }
      if (source.includes("createMockDataset")) {
        violations.push(`${relative} imports a mock dataset`);
      }
      if (/from ["']@elmorf\/mocks["']/.test(source)) {
        violations.push(`${relative} imports the mocks barrel`);
      }
      if (!file.endsWith(".test.ts") && /\bany\b/.test(source) && /:\s*any\b|as any\b/.test(source)) {
        violations.push(`${relative} uses any`);
      }
    }

    for (const file of featureViews) {
      const source = readFileSync(file, "utf8");
      if (/#[0-9a-fA-F]{3,8}\b/.test(source)) {
        violations.push(`${path.relative(repoRoot, file)} uses a raw hex color`);
      }
    }

    const landing = filesUnder(path.join(repoRoot, "apps/site/components/landing"), /\.(ts|tsx)$/);
    for (const file of landing) {
      const source = readFileSync(file, "utf8");
      if (/sigma|graphology|@elmorf\/graph/.test(source)) {
        violations.push(`${path.relative(repoRoot, file)} pulls the graph runtime into the landing`);
      }
    }

    expect(violations).toEqual([]);
  });
});
