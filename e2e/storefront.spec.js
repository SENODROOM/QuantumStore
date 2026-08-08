import { test, expect } from '@playwright/test';

test.describe('QuantumStore e2e', () => {
  test('guest checkout flow', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible();

    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });
    await firstCard.locator('a').first().click();

    await expect(page.locator('.detail-body h1')).toBeVisible();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'Checkout' }).click();

    await page.locator('label', { hasText: 'Full name' }).locator('input').fill('Guest Buyer');
    await page.locator('label', { hasText: 'Email' }).locator('input').fill('guest@example.com');
    await page.locator('label', { hasText: 'Phone' }).locator('input').fill('5551234567');
    await page.locator('label', { hasText: 'Shipping address' }).locator('textarea').fill('123 Quantum Street, City');
    await page.getByRole('button', { name: /Place order/ }).click();

    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible({ timeout: 30000 });
  });

  test('admin login and product create', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('label', { hasText: 'Email' }).locator('input').fill('admin@quaantumlogicslimited.com');
    await page.locator('label', { hasText: 'Password' }).locator('input').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Quantum Logics Limited')).toBeVisible({ timeout: 30000 });
    await page.getByRole('link', { name: 'Products', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    const name = `E2E Product ${Date.now()}`;
    await page.locator('form.admin-form label', { hasText: 'Name' }).locator('input').fill(name);
    await page.locator('form.admin-form label', { hasText: 'Price' }).locator('input').fill('199');
    await page.locator('form.admin-form label', { hasText: 'Stock' }).locator('input').fill('5');
    await page.locator('form.admin-form label', { hasText: 'Image URL' }).locator('input').fill(
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
    );
    await page
      .locator('form.admin-form label', { hasText: 'Description' })
      .locator('textarea')
      .fill('Automated end-to-end test product description.');
    await page.getByRole('button', { name: 'Add product' }).click();
    await expect(page.getByText(name)).toBeVisible({ timeout: 30000 });
  });

  test('coupon apply on checkout', async ({ page }) => {
    await page.goto('/shop');
    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });
    await firstCard.locator('a').first().click();
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'Checkout' }).click();

    await page.getByPlaceholder('Coupon code').fill('WELCOME10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/Discount/)).toBeVisible({ timeout: 15000 });
  });
});
