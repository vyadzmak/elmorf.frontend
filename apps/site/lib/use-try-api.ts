"use client";

import { createApiClient } from "@elmorf/api-client";
import { useMemo } from "react";
import { useTryApiBaseUrl } from "@/components/try/try-providers";

export function useTryApiClient() {
  const baseUrl = useTryApiBaseUrl();
  return useMemo(() => createApiClient({ baseUrl }), [baseUrl]);
}
