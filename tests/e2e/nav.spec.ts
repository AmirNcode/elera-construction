import { test, expect } from '@playwright/test';

test('header nav links are present on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  for (const label of ['Services', 'Projects', 'Process', 'About', 'FAQ']) {
    await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
  }
  // The phone link appears in both the header and the footer — `.first()` matches the header one.
  await expect(page.getByRole('link', { name: '416-837-6897' }).first()).toBeVisible();
});

test('404 page renders with both CTAs', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText("couldn't find");
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact us' })).toBeVisible();
});
