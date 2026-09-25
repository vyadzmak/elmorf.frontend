"use client";

import { createApiClient, ElmorfApiError } from "@elmorf/api-client";
import { useMemo } from "react";
import { useApiBaseUrl } from "@/components/app-providers";

export function useApiClient() {
  const baseUrl = useApiBaseUrl();
  return useMemo(() => createApiClient({ baseUrl }), [baseUrl]);
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ElmorfApiError && error.status === 404;
}
