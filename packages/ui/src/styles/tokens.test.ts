import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(
  path.join(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

describe("theme tokens", () => {
  it("defines the same semantic colors for light and dark", () => {
    for (const token of [
      "--background",
      "--foreground",
      "--primary",
      "--elmorf-brass",
      "--elmorf-graph-node",
      "--elmorf-success",
    ]) {
      expect(tokens.split(token).length - 1).toBeGreaterThanOrEqual(2);
    }
  });
});
