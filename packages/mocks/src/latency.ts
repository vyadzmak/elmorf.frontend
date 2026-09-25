let latencyMs: number | null = null;

export function setMockLatency(ms: number | null): void {
  latencyMs = ms;
}

export function resolveMockLatency(scenario: string): number {
  if (latencyMs !== null) {
    return latencyMs;
  }

  if (scenario === "slow-network") {
    return 1200;
  }

  return 120;
}
