import { screen } from "@testing-library/react";
import { Button } from "@elmorf/ui/components/ui/button";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./render";

describe("renderWithProviders", () => {
  it("renders a UI primitive inside the theme provider", () => {
    renderWithProviders(<Button>Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toBeTruthy();
  });
});
