import type { Session } from "@elmorf/domain";
import { clearCompileJobs, seedFixtureCompilationLogs } from "./compile-jobs";
import { clearQueryJobs } from "./query-jobs";
import { createMockDataset, type MockDataset } from "./dataset";
import type { MockScenario } from "./scenarios";
import { clearSourceJobs } from "./source-jobs";

let dataset: MockDataset = createMockDataset("happy");
let scenario: MockScenario = "happy";

export function getMockDataset(): MockDataset {
  return dataset;
}

export function getMockScenario(): MockScenario {
  return scenario;
}

export function resetMockStore(nextScenario: MockScenario = "happy"): void {
  scenario = nextScenario;
  dataset = createMockDataset(nextScenario);
  clearSourceJobs();
  clearCompileJobs();
  clearQueryJobs();
  seedFixtureCompilationLogs(dataset.compilations);
}

export function replaceMockDataset(next: MockDataset): void {
  dataset = next;
}

export function setMockSession(session: Session | null): void {
  dataset = { ...dataset, session };
}
