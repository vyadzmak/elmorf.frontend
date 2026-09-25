"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  applyDataPatch,
  parseDataSearch,
  serializeDataSearch,
  type DataSearchPatch,
} from "@/features/data/search-params";

export function useDataParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = parseDataSearch(params);
  const commit = useCallback(
    (patch: DataSearchPatch) => {
      const next = applyDataPatch(parseDataSearch(new URLSearchParams(window.location.search)), patch);
      const query = serializeDataSearch(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { search, commit };
}
