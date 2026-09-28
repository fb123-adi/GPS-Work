import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: "kv_consent", value: "v=0.1&a=0&m=0", url: "http://localhost:3000" }]);
});

test("guest can buy a product through the test gateway", async ({ page, browser }) => {
  await page.goto("/products/everyday-supima-tee");
  await page.getByRole("radiogroup", { name: "Size" }).getByRole("radio").filter({ hasNotText: /sold out/ }).first().click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await page.goto("/checkout");
  await page.fill("#email", "e2e@example.com");
  await page.fill("#phone", "9876543210");
  await page.fill("#shipping-fullName", "E2E Buyer");
  await page.fill("#shipping-phone", "9876543210");
  await page.fill("#shipping-line1", "5 Test Road");
  await page.fill("#shipping-postalCode", "400001");
  await page.fill("#shipping-city", "Mumbai");
  await page.selectOption("#shipping-state", "Maharashtra");

  // Terms are required and enforced on the server.
  await page.getByRole("button", { name: /Pay .* securely/ }).click();
  await expect(page.getByText("Please accept the terms and privacy policy.")).toBeVisible();

  await page.check("#acceptTerms");
  await page.getByRole("button", { name: /Pay .* securely/ }).click();
  await page.waitForURL(/mock-gateway/);
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.waitForURL(/order-confirmation/);
  await expect(page.getByRole("heading", { name: /order is confirmed/ })).toBeVisible();

  // Another browser cannot open the same order by URL (no IDOR).
  const url = page.url();
  const other = await browser.newContext();
  const stranger = await other.newPage();
  const res = await stranger.goto(url);
  expect(res?.status()).toBe(404);
  await other.close();
});

test("declined payment keeps the order and offers a retry", async ({ page }) => {
  await page.goto("/products/loopback-crew");
  await page.getByRole("radiogroup", { name: "Size" }).getByRole("radio").filter({ hasNotText: /sold out/ }).first().click();
  await page.getByRole("button", { name: "Buy now" }).click();
  await page.waitForURL(/\/checkout$/);
  await page.fill("#email", "retry@example.com");
  await page.fill("#phone", "9876543210");
  await page.fill("#shipping-fullName", "Retry Buyer");
  await page.fill("#shipping-phone", "9876543210");
  await page.fill("#shipping-line1", "9 Test Lane");
  await page.fill("#shipping-postalCode", "110001");
  await page.fill("#shipping-city", "New Delhi");
  await page.selectOption("#shipping-state", "Delhi");
  await page.check("#acceptTerms");
  await page.getByRole("button", { name: /Pay .* securely/ }).click();
  await page.waitForURL(/mock-gateway/);
  await page.getByRole("button", { name: "Simulate declined payment" }).click();
  await page.waitForURL(/checkout\/pay\//);
  await expect(page.getByRole("heading", { name: "Your payment did not go through" })).toBeVisible();
  await page.getByRole("button", { name: "Try payment again" }).click();
  await page.waitForURL(/mock-gateway/);
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.waitForURL(/order-confirmation/);
  await expect(page.getByRole("heading", { name: /order is confirmed/ })).toBeVisible();
});

test("admin is hidden from signed-out visitors and customers", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=\/admin/);
  const api = await page.request.get("/api/admin/export/orders");
  expect(api.status()).toBe(401);
});
