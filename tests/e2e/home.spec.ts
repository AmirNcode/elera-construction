import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders the hero with the company differentiator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('top developers');
  });

  test('renders the trust strip credentials', async ({ page }) => {
    await page.goto('/');
    // Credentials appear in both the inline TrustStrip and the footer band —
    // assert presence by first match in each, no need to disambiguate.
    await expect(page.getByText('Insured up to $2M').first()).toBeVisible();
    await expect(page.getByText('WSIB Cleared').first()).toBeVisible();
    await expect(page.getByText('2-Year Workmanship Warranty').first()).toBeVisible();
  });

  test('lists all five services with links', async ({ page }) => {
    await page.goto('/');
    for (const slug of [
      'bathroom-renovation',
      'kitchen-renovation',
      'flooring',
      'cabinetry',
      'full-home-renovation',
    ]) {
      await expect(page.locator(`a[href="/services/${slug}"]`).first()).toBeVisible();
    }
  });
});
