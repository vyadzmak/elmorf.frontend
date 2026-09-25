export interface QuerySearch {
  query?: string;
}

export interface QuerySearchPatch {
  query?: string | null;
}

function readText(value: string | null): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseQuerySearch(params: { get: (key: string) => string | null }): QuerySearch {
  const query = readText(params.get("query"));
  return {
    ...(query ? { query } : {}),
  };
}

export function applyQueryPatch(current: QuerySearch, patch: QuerySearchPatch): QuerySearch {
  const query = patch.query === undefined ? current.query : patch.query ?? undefined;
  return {
    ...(query ? { query } : {}),
  };
}

export function serializeQuerySearch(search: QuerySearch): string {
  const params = new URLSearchParams();
  if (search.query) {
    params.set("query", search.query);
  }

  return params.toString();
}
