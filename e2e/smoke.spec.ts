import { expect, test } from "@playwright/test";

const site = "http://localhost:3001";
const app = "http://localhost:3002";

test("landing, try, and locale stay on the public site", async ({ page }) => {
  await page.goto(`${site}/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Compile messy data");

  await page.getByRole("link", { name: "Try Elmorf" }).first().click();
  await expect(page).toHaveURL(/\/try$/);
  await expect(page.getByText("harbor-pine-master-services.pdf")).toBeVisible();
  await page.getByRole("button", { name: "INV-2041" }).click();
  await expect(page.getByText("Invoice INV-2041, currency USD.")).toBeVisible();
  await page.getByRole("button", { name: "Run the sample" }).click();
  await expect(page.getByRole("cell", { name: "INV-2041" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto(`${site}/ru`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Соберите разрозненные данные");
  await page.getByRole("radio", { name: "Светлая" }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.getByRole("radio", { name: "Тёмная" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("missing pages and mock sign-in stay in the product", async ({ page }) => {
  await page.goto(`${site}/missing-page`);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

  await page.goto(`${app}/`);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("main").getByText("Vendor Contracts")).toBeVisible();

  await page.getByRole("button", { name: "Ada Lang" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "do not match" })).toBeVisible();

  await page.getByLabel("Password").fill("harbor-pine");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/projects\/prj_vendor_contracts\/overview/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await page.goto(`${app}/missing-page`);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
