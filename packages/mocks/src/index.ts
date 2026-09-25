export {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_PROJECT_ID,
  createMockDataset,
  invalidProjectFixture,
  type MockDataset,
} from "./dataset";
export { handlers } from "./handlers";
export { setMockLatency } from "./latency";
export { isMockScenario, mockScenarios, type MockScenario } from "./scenarios";
export { getMockDataset, getMockScenario, resetMockStore } from "./store";

export const packageId = "mocks" as const;
