import { expect, test } from '@playwright/test';

// Public home should render hero sections (we look for a known heading component text).
test('home page renders', async ({ page }) => {
  await page.goto('/');
  const sections = page.locator('div.space-y-24');
  await expect(sections).toHaveCount(1);
});

// Visiting protected dashboard unauthenticated should redirect to admin login.
test('protected dashboard redirects when unauthenticated', async ({ page }) => {
  const response = await page.goto('/protected');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
  expect(page.url()).toContain('/login');
});

// Public login page basic form presence under /auth/login.
test('public login page has form inputs', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
