import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Twoje istniejące ustawienia i projekty
  projects: [
    { name: "Chromium", use: { browserName: "chromium" } },
    { name: "Firefox", use: { browserName: "firefox" } },
    { name: "WebKit", use: { browserName: "webkit" } },
    // Dodaj inne przeglądarki lub konfiguracje, które już masz
  ],

  // Konfiguracja do generowania jednego raportu
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],

  // Pozostaw inne ustawienia, które są w Twojej obecnej konfiguracji
  use: {
    headless: true, // Możesz zmienić na false, jeśli potrzebujesz testów bez headless
    screenshot: "on", // Zachowuje zrzuty ekranu w przypadku błędów
    video: "retain-on-failure", // Nagrania tylko, jeśli testy się nie powiodą
  },

  // Dodaj pozostałe ustawienia, które masz w swoim pliku config.ts
  testDir: "./tests", // Ścieżka do katalogu z testami, upewnij się, że jest poprawna
});
