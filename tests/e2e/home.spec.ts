import { test, expect } from '@playwright/test';

test('home page renders the company name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elera Construction');
});
