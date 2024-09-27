import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config();

test("Logowanie w trakcie zakupu", async ({ page, browserName }) => {
  test.setTimeout(120000); // Ustawienie globalnego timeoutu na 120 sekund dla tego testu

  console.log(`Uruchamianie testu na przeglądarce: ${browserName}`);
  await page.context().clearCookies();
  await page.context().clearPermissions();

  // Przejdź do strony biżuterii
  console.log("Otwieranie strony: /bizuteria");
  await page.goto("https://yes.pl/", {
    waitUntil: "networkidle",
  });

  // Sprawdź, czy okno z cookies jest widoczne i zaakceptuj je
  console.log("Sprawdzanie okna cookies...");
  const cookiesAcceptButton = await page.$(
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"
  );
  if (cookiesAcceptButton) {
    console.log("Znaleziono okno cookies, klikam 'Zgadzam się'.");
    await cookiesAcceptButton.click();
    // Poczekaj chwilę na zniknięcie okna z cookies
    await page.waitForTimeout(1000);
  } else {
    console.log("Nie znaleziono okna cookies.");
  }

  // Kliknij przycisk logowania
  console.log("Klikam przycisk logowania.");
  await page.click("a.login-link.icon-account");

  // Zaloguj się na konto
  console.log("Wprowadzam dane logowania.");
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Email lub hasło nie zostały zdefiniowane w zmiennych środowiskowych."
    );
  }

  await page.fill('input[name="login[username]"]', email);
  await page.fill('input[name="login[password]"]', password);
  await page.click("button#send2");

  // Wyodrębnij adres email z kodu JavaScript
  const emailFromScript = await page.evaluate(() => {
    const scripts = document.querySelectorAll("script");
    for (let script of scripts) {
      const scriptContent = script.textContent || "";
      if (scriptContent.includes("SyneriseTC.sendFormData")) {
        const emailMatch = scriptContent.match(/email:\s*'([^']+)'/);
        if (emailMatch && emailMatch[1]) {
          return emailMatch[1].trim();
        }
      }
    }
    return null;
  });

  // Porównaj adresy email bez wyświetlania ich w logach
  const emailsMatch = emailFromScript === email;

  console.log("Wylogowywanie po teście.");
  await page.goto("https://yes.pl/wyloguj", { waitUntil: "networkidle" });

  // Wyświetl w logach tylko wynik porównania
  console.log(`Czy adresy email się zgadzają?: ${emailsMatch}`);

  // Dodaj asercję
  expect(emailsMatch).toBe(true);

  console.log("Wylogowywanie po teście.");
  await page.goto("https://yes.pl/customer/account/logout/", {
    waitUntil: "networkidle",
  });

  console.log("Test zakończony.");
});
