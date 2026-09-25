import { describe, expect, it } from "vitest";
import { packageId } from "./index";

describe("@elmorf/mocks", () => {
  it("exposes the workspace boundary", () => {
    expect(packageId).toBe("mocks");
  });
});
