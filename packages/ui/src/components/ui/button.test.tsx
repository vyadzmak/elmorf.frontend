import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders an enabled button", () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toBeTruthy();
  });
});
