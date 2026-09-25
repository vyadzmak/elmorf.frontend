"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  applyQueryPatch,
  parseQuerySearch,
  serializeQuerySearch,
  type QuerySearchPatch,
} from "@/features/query/search-params";

export function useQuerySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = parseQuerySearch(params);
  const commit = useCallback(
    (patch: QuerySearchPatch) => {
      const next = applyQueryPatch(
        parseQuerySearch(new URLSearchParams(window.location.search)),
        patch,
      );
      const query = serializeQuerySearch(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { search, commit };
}
