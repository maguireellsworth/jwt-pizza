import { test, expect } from '@playwright/test';

test('register a new user', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();

  await page.getByRole('textbox', { name: 'Full name' }).fill('Fake Name');
  await page.getByRole('textbox', { name: 'Email address' }).fill('fake@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'FN' }).click();
  await expect(page.getByText('name: Fake Nameemail: fake@email.comrole: dinerHow have you lived this long')).toBeVisible();
  // await expect(page.getByText('Fake Name')).toBeVisible();
});