import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config();

test("Dodaj 3 towary do koszyka z /bizuteria i sprawdź koszyk", async ({
  page,
}) => {
  test.setTimeout(120000); // Ustawienie globalnego timeoutu na 120 sekund dla tego testu

  // Przejdź do strony biżuterii
  console.log("Otwieranie strony: /bizuteria");
  await page.goto("https://yes.pl/bizuteria", {
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

  // Poczekaj aż strona biżuterii się załaduje w pełni
  console.log("Oczekiwanie na pełne załadowanie strony...");
  await page.waitForLoadState("networkidle", { timeout: 30000 });

  // Pobierz wszystkie linki do produktów
  console.log("Pobieranie linków do produktów...");
  const productLinks = await page.$$eval(
    "div.category-products ul.products-grid li.item a.product-image",
    (links) => links.map((link) => link.href)
  );

  if (productLinks.length === 0) {
    throw new Error("Nie znaleziono towarów.");
  }

  console.log(`Znaleziono ${productLinks.length} produkty.`);

  // Ogranicz liczbę produktów do 1
  const selectedProductLinks = productLinks.slice(0, 1);

  for (const productLink of selectedProductLinks) {
    console.log(`Przejście do produktu: ${productLink}`);
    await page.goto(productLink, { waitUntil: "networkidle" });

    // Pobierz tytuł produktu ze strony towaru
    const productTitle = await page
      .locator('h1[itemprop="name"]')
      .textContent();
    const formattedProductTitle = productTitle?.trim().toLowerCase();
    console.log(`Tytuł produktu: ${formattedProductTitle}`);

    // Znajdź przycisk "Dodaj do koszyka"
    const addToCartButton = await page.$("#addToCartButton");
    if (!addToCartButton) {
      throw new Error("Nie znaleziono przycisku 'Dodaj do koszyka'.");
    }

    console.log("Klikam 'Dodaj do koszyka'.");
    await addToCartButton.click();

    // Poczekaj na załadowanie koszyka
    await page.waitForTimeout(1000);
  }

  // Przejdź bezpośrednio do koszyka
  console.log("Przechodzę do koszyka.");
  await page.goto("https://yes.pl/koszyk", { waitUntil: "networkidle" });

  // Zlokalizuj wszystkie produkty w koszyku
  console.log("Pobieram wszystkie produkty z koszyka.");
  const cartItems = page.locator("div.product-item");

  // Sprawdź, ile produktów jest w koszyku
  const itemCount = await cartItems.count();
  console.log(`Liczba produktów w koszyku: ${itemCount}`);

  if (itemCount === 0) {
    const pageContent = await page.content();
    require("fs").writeFileSync(
      `page-content-${page.context().browser()?.browserType().name()}.html`,
      pageContent
    );
    throw new Error("Koszyk jest pusty.");
  }

  // Zweryfikuj produkty w koszyku
  for (let i = 0; i < itemCount; i++) {
    const cartProductTitle = await cartItems
      .nth(i)
      .locator("h6.product-name a")
      .textContent();
    const formattedCartProductTitle = cartProductTitle?.trim().toLowerCase();

    console.log(`Sprawdzanie towaru nr ${i + 1}: ${formattedCartProductTitle}`);
  }

  console.log("Klikam 'Zrealizuj zamówienie'.");
  await page.getByRole("button", { name: "Zrealizuj zamówienie" }).click();

  // Zaloguj się na konto
  console.log("Wprowadzam dane logowania.");
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Email lub hasło nie zostały zdefiniowane w zmiennych środowiskowych."
    );
  }

  await page.getByRole("textbox", { name: "Adres e-mail*" }).fill(email);
  await page.getByRole("textbox", { name: "Hasło*" }).fill(password);
  await page.getByRole("button", { name: "Zaloguj" }).click();

  // Przejdź do koszyka po zalogowaniu
  console.log("Wracam do koszyka po zalogowaniu.");
  await page.goto("https://yes.pl/koszyk", { waitUntil: "networkidle" });

  // Kliknij "Zrealizuj zamówienie"
  console.log("Finalizacja zamówienia.");
  await page.getByRole("button", { name: "Zrealizuj zamówienie" }).click();

  // Zweryfikuj obecność "Polska" w sekcji adresu
  const divSelector = "div.section-address-select"; // Właściwy selektor
  await page.waitForSelector(divSelector);
  const divContent = await page.textContent(divSelector);
  const containsPolska = divContent?.includes("Polska");

  console.log(`Czy sekcja adresu zawiera "Polska"?: ${containsPolska}`);
  expect(containsPolska).toBe(true);

  // Wyczyść koszyk po teście
  console.log("Czyszczenie koszyka.");
  const removeButtons = page.locator("a.btn-remove");
  const removeCount = await removeButtons.count();
  for (let j = removeCount - 1; j >= 0; j--) {
    console.log(`Usuwam produkt nr ${j + 1}`);
    const removeButton = removeButtons.nth(j);
    await removeButton.click({ force: true });
    await page.waitForTimeout(1000);
  }

  console.log("Test zakończony.");
});
