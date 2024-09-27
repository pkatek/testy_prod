import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results", // Gdzie będą zapisywane wyniki
  timeout: 60000,
  retries: 2,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }], // Jeden folder dla raportu
    ["junit", { outputFile: "test-results/results.xml" }], // Dodatkowy format, jeśli potrzebny
  ],
  use: {
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
