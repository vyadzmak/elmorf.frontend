import { QueryClient } from "@tanstack/react-query";
import { ElmorfApiError } from "./error";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ElmorfApiError) {
            return error.retryable && failureCount < 2;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
