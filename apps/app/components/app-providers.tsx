"use client";

import { createQueryClient } from "@elmorf/api-client";
import { Toaster } from "@elmorf/ui/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

const MockReadyContext = createContext(false);
const ApiBaseUrlContext = createContext("http://localhost:4000");

export function useMockReady(): boolean {
  return useContext(MockReadyContext);
}

export function useApiBaseUrl(): string {
  return useContext(ApiBaseUrlContext);
}

export function AppProviders({
  apiBaseUrl,
  mockMode,
  children,
}: {
  apiBaseUrl: string;
  mockMode: boolean;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());
  const [mockReady, setMockReady] = useState(!mockMode);

  useEffect(() => {
    if (!mockMode) {
      return;
    }

    let cancelled = false;
    void import("@elmorf/mocks/browser").then(({ startMockWorker }) =>
      startMockWorker().then(() => {
        if (!cancelled) {
          setMockReady(true);
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [mockMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <MockReadyContext.Provider value={mockReady}>
        <ApiBaseUrlContext.Provider value={apiBaseUrl}>
          {children}
          <Toaster />
        </ApiBaseUrlContext.Provider>
      </MockReadyContext.Provider>
    </QueryClientProvider>
  );
}
