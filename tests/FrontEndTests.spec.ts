import { test, expect } from 'playwright-test-coverage';

test('checks everything is correct on the homepage', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Order' })).toBeVisible();
  await expect(page.getByLabel('Global').getByRole('link', { name: 'Franchise' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

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

test('purchase with login', async ({page}) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Order now' }).click();
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).first().click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).first().click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');
  await expect(page.getByRole('main')).toContainText('0.008 ₿');
})