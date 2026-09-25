export const mockScenarios = [
  "happy",
  "empty",
  "processing",
  "compile-running",
  "compile-failed",
  "partial",
  "conflicts",
  "large-graph",
  "api-error",
  "permission-limited",
  "slow-network",
] as const;

export type MockScenario = (typeof mockScenarios)[number];

export function isMockScenario(value: string): value is MockScenario {
  return mockScenarios.some((scenario) => scenario === value);
}
