import { expect, test } from "@playwright/test";

const PAGES = ["/", "/shop", "/products/heavyweight-hoodie", "/cart", "/checkout", "/login", "/track-order", "/returns", "/contact", "/journal", "/legal/privacy"];

test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: "kv_consent", value: "v=0.1&a=0&m=0", url: "http://localhost:3000" }]);
});

for (const path of PAGES) {
  test(`no horizontal overflow or console errors on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("reduced motion shows the static hero with content visible", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.locator("section.hero").getAttribute("data-mode")).toBe("static");
  expect(await page.locator(".is-armed:not(.is-in)").count()).toBe(0);
  await ctx.close();
});

test("every scroll reveal completes after scrolling the home page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  expect(await page.locator("[data-reveal].is-armed:not(.is-in)").count()).toBe(0);
});
