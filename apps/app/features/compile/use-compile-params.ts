"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  applyCompilePatch,
  parseCompileSearch,
  serializeCompileSearch,
  type CompileSearchPatch,
} from "@/features/compile/search-params";

export function useCompileParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = parseCompileSearch(params);
  const commit = useCallback(
    (patch: CompileSearchPatch) => {
      const next = applyCompilePatch(
        parseCompileSearch(new URLSearchParams(window.location.search)),
        patch,
      );
      const query = serializeCompileSearch(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { search, commit };
}
