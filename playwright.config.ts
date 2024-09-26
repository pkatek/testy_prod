import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",

  /* Maksymalny czas trwania pojedynczego testu */
  timeout: 120000,

  /* Uruchamianie testów w plikach równolegle */
  fullyParallel: true,

  /* Zakończ budowanie na CI, jeśli przypadkowo pozostawiono test.only w kodzie źródłowym */
  forbidOnly: !!process.env.CI,

  /* Liczba ponownych prób na CI */
  retries: process.env.CI ? 2 : 0,

  /* Wyłączenie równoległych testów na CI */
  workers: process.env.CI ? 1 : undefined,

  /* Konfiguracja raportera */
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],

  /* Wspólne ustawienia dla wszystkich projektów poniżej */
  use: {
    /* Kolekcjonowanie śladu przy ponownych próbach nieudanego testu */
    trace: "on-first-retry",
  },

  /* Konfiguracja projektów dla głównych przeglądarek */
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

    /* Testowanie na widokach mobilnych (opcjonalne) */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Testowanie na markowych przeglądarkach (opcjonalne) */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Uruchamianie lokalnego serwera przed rozpoczęciem testów (jeśli potrzebne) */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
