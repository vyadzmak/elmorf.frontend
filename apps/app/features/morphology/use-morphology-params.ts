"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  applyMorphologyPatch,
  parseMorphologySearch,
  serializeMorphologySearch,
  type MorphologySearchPatch,
} from "@/features/morphology/search-params";

export function useMorphologyParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const search = parseMorphologySearch(params);
  const commit = useCallback(
    (patch: MorphologySearchPatch) => {
      const next = applyMorphologyPatch(
        parseMorphologySearch(new URLSearchParams(window.location.search)),
        patch,
      );
      const query = serializeMorphologySearch(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return { search, commit };
}
