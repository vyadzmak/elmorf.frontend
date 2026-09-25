import { describe, expect, it } from "vitest";
import { packageId } from "./index";

describe("@elmorf/domain", () => {
  it("exposes the workspace boundary", () => {
    expect(packageId).toBe("domain");
  });
});
