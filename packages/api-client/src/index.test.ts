import { describe, expect, it } from "vitest";
import { packageId } from "./index";

describe("@elmorf/api-client", () => {
  it("exposes the workspace boundary", () => {
    expect(packageId).toBe("api-client");
  });
});
