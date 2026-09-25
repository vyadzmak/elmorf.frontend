import { describe, expect, it } from "vitest";
import { ProjectSchema } from "./project";

const invalidProjectFixture = {
  id: "prj_broken",
  name: "",
  capabilities: {
    canAddData: true,
  },
  currentModelVersionId: null,
};

describe("domain schemas", () => {
  it("rejects an invalid project fixture", () => {
    expect(() => ProjectSchema.parse(invalidProjectFixture)).toThrow();
  });
});
