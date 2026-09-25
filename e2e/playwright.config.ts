import { defineConfig, devices } from "@playwright/test";

const site = "http://localhost:3001";
const app = "http://localhost:3002";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "pnpm --filter @elmorf/site dev",
      url: site,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @elmorf/app dev",
      url: app,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
