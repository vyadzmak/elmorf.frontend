import { SourceKindSchema, type Source, type SourceKind } from "@elmorf/domain";

export const dataStatusFilters = ["processing", "ready", "failed", "cancelled"] as const;

export type DataStatusFilter = (typeof dataStatusFilters)[number];

export interface DataSearch {
  status?: DataStatusFilter;
  kind?: SourceKind;
  q?: string;
  source?: string;
}

export interface DataSearchPatch {
  status?: DataStatusFilter | null;
  kind?: SourceKind | null;
  q?: string | null;
  source?: string | null;
}

function isStatus(value: string | null): value is DataStatusFilter {
  return dataStatusFilters.some((item) => item === value);
}

function readText(value: string | null): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseDataSearch(params: { get: (key: string) => string | null }): DataSearch {
  const statusValue = params.get("status");
  const kind = SourceKindSchema.safeParse(params.get("kind"));
  const query = readText(params.get("q"));
  const source = readText(params.get("source"));

  return {
    ...(isStatus(statusValue) ? { status: statusValue } : {}),
    ...(kind.success ? { kind: kind.data } : {}),
    ...(query ? { q: query } : {}),
    ...(source ? { source } : {}),
  };
}

export function applyDataPatch(current: DataSearch, patch: DataSearchPatch): DataSearch {
  const status = patch.status === undefined ? current.status : patch.status ?? undefined;
  const kind = patch.kind === undefined ? current.kind : patch.kind ?? undefined;
  const query = patch.q === undefined ? current.q : patch.q ?? undefined;
  const source = patch.source === undefined ? current.source : patch.source ?? undefined;

  return {
    ...(status ? { status } : {}),
    ...(kind ? { kind } : {}),
    ...(query ? { q: query } : {}),
    ...(source ? { source } : {}),
  };
}

export function serializeDataSearch(search: DataSearch): string {
  const params = new URLSearchParams();
  if (search.status) {
    params.set("status", search.status);
  }
  if (search.kind) {
    params.set("kind", search.kind);
  }
  if (search.q) {
    params.set("q", search.q);
  }
  if (search.source) {
    params.set("source", search.source);
  }

  return params.toString();
}

export function sourceMatches(source: Source, search: DataSearch): boolean {
  if (search.q && !source.name.toLowerCase().includes(search.q.toLowerCase())) {
    return false;
  }

  if (search.kind && source.kind !== search.kind) {
    return false;
  }

  if (!search.status) {
    return true;
  }

  if (search.status === "processing") {
    const status = source.processing.status;
    return status === "queued" || status === "uploading" || status === "processing";
  }

  return source.processing.status === search.status;
}

export function sourceUpdatedAt(source: Source): string {
  if (source.processing.status === "ready") {
    return source.processing.completedAt;
  }

  if (source.processing.status === "cancelled") {
    return source.processing.cancelledAt;
  }

  return source.createdAt;
}
