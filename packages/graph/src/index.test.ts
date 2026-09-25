import { describe, expect, it } from "vitest";
import { packageId } from "./index";

describe("@elmorf/graph", () => {
  it("exposes the workspace boundary", () => {
    expect(packageId).toBe("graph");
  });
});
