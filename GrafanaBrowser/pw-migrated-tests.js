import { check } from 'k6';  
import { expect } from 'https://jslib.k6.io/k6-testing/0.6.1/index.js';  
import { browser } from 'k6/browser';  

export const options = {  
  thresholds: {  
    'browser_web_vital_lcp': ['p(75)<2500'],  
    'browser_web_vital_fcp': ['p(75)<1800'],  
    'browser_web_vital_ttfb': ['p(75)<800'],  
    'browser_http_req_duration': ['p(95)<3000'],  
  },  
  scenarios: {  
    user: {  
      exec: 'user',  
      vus: 5,
      iterations: 25,
      executor: 'shared-iterations',  
      options: { browser: { type: 'chromium' } },  
    },  
  },  
};  

export async function user() {  
  const page = await browser.newPage();  
  try {  
    await login(page);
    const action = pickAction();  
    await action(page);
  } finally {  
    await page.close();  
  }  
}  

async function login(page) {  
  await page.goto('http://pizza.maguireellsworthpizza.click');  
  await page.getByRole('link', { name: 'Login' }).click();  
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');  
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');  
  await page.getByRole('button', { name: 'Login' }).click();  
  check(page, { 'logged in': (p) => p.url().includes('pizza') });
}  

async function browseMenu(page) {  
  await page.getByRole('button', { name: 'Order now' }).click();  
  await expect(page.locator('h2')).toContainText('Awesome is a click away');  
  check(page, { 'menu loaded': (p) => p.url() !== null });  
}  

async function orderPizza(page) {  
  await page.getByRole('button', { name: 'Order now' }).click();  
  await expect(page.locator('h2')).toContainText('Awesome is a click away');  
  await page.getByRole('combobox').selectOption('1');  
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();  
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();  
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');  
  await page.getByRole('button', { name: 'Checkout' }).click();  
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');  
  await page.getByRole('button', { name: 'Pay now' }).click();  
  await expect(page.getByRole('main')).toContainText('0.008 ₿');  
  await page.getByRole('button', { name: 'Verify' }).click();  
  const h3Text = await page.locator('h3').textContent();  
  check(null, { 'order verified': () => h3Text.includes('valid') });  
}  

async function viewProfile(page) {  
  await page.getByRole('link', { name: 'pd' }).click();  
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');  
  check(page, { 'profile loaded': (p) => p.url().includes('pizza') });  
}  

function pickAction() {  
  const r = Math.random();  
  if (r < 0.6) return browseMenu;  
  if (r < 0.9) return orderPizza;  
  return viewProfile;  
}