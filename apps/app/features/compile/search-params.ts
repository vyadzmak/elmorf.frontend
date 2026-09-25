export interface CompileSearch {
  compilation?: string;
}

export interface CompileSearchPatch {
  compilation?: string | null;
}

function readText(value: string | null): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseCompileSearch(params: { get: (key: string) => string | null }): CompileSearch {
  const compilation = readText(params.get("compilation"));
  return {
    ...(compilation ? { compilation } : {}),
  };
}

export function applyCompilePatch(current: CompileSearch, patch: CompileSearchPatch): CompileSearch {
  const compilation =
    patch.compilation === undefined ? current.compilation : patch.compilation ?? undefined;
  return {
    ...(compilation ? { compilation } : {}),
  };
}

export function serializeCompileSearch(search: CompileSearch): string {
  const params = new URLSearchParams();
  if (search.compilation) {
    params.set("compilation", search.compilation);
  }

  return params.toString();
}
