import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@elmorf/ui/components/theme-provider";
import type { ReactElement, ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Providers, ...options });
}
