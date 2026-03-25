import { test, expect } from 'playwright/test';

test.describe('Smoke tests', () => {
  test('retail storefront loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('body')).not.toHaveText('Something went wrong');
  });

  test('wholesale storefront loads', async ({ page }) => {
    await page.goto('/wholesale');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/#admin');
    await expect(page.locator('input[placeholder*="電話"]')).toBeVisible({ timeout: 10000 });
  });

  test('API health: confirm-payment rejects GET', async ({ request }) => {
    const res = await request.get('/api/confirm-payment');
    expect(res.status()).toBe(405);
  });
});
