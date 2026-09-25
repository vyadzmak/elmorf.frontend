"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface InspectorPanel {
  title: string;
  detail?: string;
  content?: ReactNode;
  onClose?: () => void;
}

export interface ShellContextValue {
  inspector: InspectorPanel | null;
  openInspector: (panel: InspectorPanel) => void;
  closeInspector: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error("useShell must be used within the application shell.");
  }

  return value;
}
