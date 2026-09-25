const workspaceSections = [
  "overview",
  "data",
  "compile",
  "morphology",
  "query",
] as const;

export type WorkspaceSection = (typeof workspaceSections)[number];

export function isWorkspaceSection(value: string): value is WorkspaceSection {
  return workspaceSections.some((section) => section === value);
}

export function projectIdFromPath(pathname: string): string | null {
  const match = /^\/projects\/([^/]+)/.exec(pathname);
  const projectId = match?.[1];
  if (!projectId || projectId === "new") {
    return null;
  }

  return decodeURIComponent(projectId);
}

export function sectionFromPath(pathname: string): WorkspaceSection | null {
  const projectId = projectIdFromPath(pathname);
  if (!projectId) {
    return null;
  }

  const rest = pathname.slice(`/projects/${projectId}/`.length);
  const segment = rest.split("/")[0] ?? "";
  return isWorkspaceSection(segment) ? segment : null;
}

export function isSettingsPath(pathname: string): boolean {
  return pathname.includes("/settings");
}

export function sectionHref(projectId: string, section: WorkspaceSection): string {
  return `/projects/${encodeURIComponent(projectId)}/${section}`;
}
