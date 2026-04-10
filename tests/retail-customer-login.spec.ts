import { test, expect } from 'playwright/test';

/** Minimal `members` row shape returned by `/api/customer-auth` (password_hash stripped). */
function mockLoginResponse() {
  return {
    user: {
      id: 'u-playwright-retail',
      name: 'Playwright Retail',
      email: 'shopper@example.com',
      phone_number: '91234567',
      points: 0,
      tier: 'Bronze',
      role: 'customer',
      member_type: 'retail',
    },
    sessionToken: 'playwright-session-token',
    issuedAt: Date.now(),
  };
}

test.describe('Retail customer login (email or phone)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('coolfood_member_id');
        localStorage.removeItem('coolfood_session_token');
        localStorage.removeItem('coolfood_session_issued_at');
      } catch {
        /* ignore */
      }
    });
  });

  test('login POST uses email as identifier when user enters an address', async ({ page }) => {
    let captured: Record<string, unknown> | null = null;

    await page.route('**/api/customer-auth', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }
      const body = JSON.parse(req.postData() || '{}') as Record<string, unknown>;
      captured = body;
      if (body.action === 'restore-session') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'no session', code: 'NOT_FOUND' }),
        });
        return;
      }
      if (body.action === 'login') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockLoginResponse()),
        });
        return;
      }
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unexpected action' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: '會員' }).click();
    await page.getByPlaceholder('電郵或電話').fill('shopper@example.com');
    await page.getByPlaceholder('密碼', { exact: true }).fill('any-password');
    await page.locator('form.space-y-4 button[type="submit"]').click();

    await expect.poll(() => captured).toBeTruthy();
    expect(captured!.action).toBe('login');
    expect(captured!.identifier).toBe('shopper@example.com');
    expect(captured!.password).toBe('any-password');
    expect(captured!.isWholesale).toBe(false);

    await expect(page.getByRole('button', { name: '退出登入' })).toBeVisible({ timeout: 15000 });
  });

  test('login POST uses phone as identifier when user enters digits (no @)', async ({ page }) => {
    let captured: Record<string, unknown> | null = null;

    await page.route('**/api/customer-auth', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }
      const body = JSON.parse(req.postData() || '{}') as Record<string, unknown>;
      captured = body;
      if (body.action === 'restore-session') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'no session', code: 'NOT_FOUND' }),
        });
        return;
      }
      if (body.action === 'login') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockLoginResponse()),
        });
        return;
      }
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unexpected action' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: '會員' }).click();
    await page.getByPlaceholder('電郵或電話').fill('91234567');
    await page.getByPlaceholder('密碼', { exact: true }).fill('secret12');
    await page.locator('form.space-y-4 button[type="submit"]').click();

    await expect.poll(() => captured).toBeTruthy();
    expect(captured!.action).toBe('login');
    expect(captured!.identifier).toBe('91234567');
    expect(captured!.password).toBe('secret12');
    expect(captured!.isWholesale).toBe(false);

    await expect(page.getByRole('button', { name: '退出登入' })).toBeVisible({ timeout: 15000 });
  });
});
