import { test, expect } from 'playwright-test-coverage';

test('checks everything is correct on the homepage', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Order' })).toBeVisible();
  await expect(page.getByLabel('Global').getByRole('link', { name: 'Franchise' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

