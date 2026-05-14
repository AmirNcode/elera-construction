import { test, expect } from '@playwright/test';

test.describe('Responsive chrome', () => {
  test('desktop: no hamburger, no mobile sticky bar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
    // Mobile sticky-bar 'Get a quote →' link only renders inside the md:hidden bar
    const stickyQuote = page.locator('div.md\\:hidden a[href="/contact"]').first();
    await expect(stickyQuote).toBeHidden();
  });

  test('mobile: hamburger opens overlay; sticky bar is visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeHidden();
    // Mobile sticky bar has a tel: link
    await expect(page.locator('a[href="tel:+14168376897"]').last()).toBeVisible();
  });
});
