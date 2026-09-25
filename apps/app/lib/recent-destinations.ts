import {
  isWorkspaceSection,
  type WorkspaceSection,
} from "@/lib/workspace-path";

const destinationsKey = "elmorf.recent-sections";
const projectKey = "elmorf.recent-project";
const limit = 5;

export interface RecentDestination {
  projectId: string;
  section: WorkspaceSection;
}

export function readRecentProjectId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(projectKey);
}

export function rememberProjectId(projectId: string): void {
  window.localStorage.setItem(projectKey, projectId);
}

export function readRecentDestinations(): RecentDestination[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(destinationsKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "projectId" in item &&
        "section" in item &&
        typeof item.projectId === "string" &&
        typeof item.section === "string" &&
        isWorkspaceSection(item.section)
      ) {
        return [{ projectId: item.projectId, section: item.section }];
      }

      return [];
    });
  } catch {
    return [];
  }
}

export function rememberDestination(destination: RecentDestination): void {
  const next = [
    destination,
    ...readRecentDestinations().filter(
      (item) =>
        item.projectId !== destination.projectId ||
        item.section !== destination.section,
    ),
  ].slice(0, limit);
  window.localStorage.setItem(destinationsKey, JSON.stringify(next));
}
