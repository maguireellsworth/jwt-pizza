import { test, expect, Page, Route } from '@playwright/test'
import { User, Role, Store } from '../src/service/pizzaService'

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'f@jwt.com': { id: '4', name: 'some name', email: 'f@jwt.com', password: 'franchisee', roles: [{role: Role.Franchisee}] },
    'a@jwt.com': { id: '5', name: 'some name', email: 'a@jwt.com', password: 'admin', roles: [{role: Role.Admin}] }
  };

  const stores = [];

  const franchises = [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];

  async function authorize(route: Route){
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  }

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    await authorize(route);
  });

  await page.route('**/api/auth', async (route) => {
    await authorize(route);
  })

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: franchises
    };
    // expect(route.request().method()).toBe('GET');
    if(route.request().method() == 'GET'){
        await route.fulfill({ json: franchiseRes });
    } else if(route.request().method() == 'POST'){
        const createReq = route.request().postDataJSON();
        franchises.push({ id: 5, name: createReq.name, stores: []})
        await route.fulfill({ json: {stores: [], id: 1, name: createReq.name, admins: []}})
    }
  });

  // create a store
  await page.route(/\/api\/franchise\/\d+\/store(\?.*)?$/, async (route) => {
    const loginReq = route.request().postDataJSON();
    const response = {
        id: 1,
        franchiseId: 1,
        name: loginReq.name
    }
    await route.fulfill({ json: response})
});


  // go to franchise page for id
  await page.route('**/api/franchise/**', async (route) => {
    const response = {
        id: 3,
        name: 'Fake Franchise',
        admins: [loggedInUser],
        stores: [{
            id: 1,
            name: 'FakeStore',
            totalRevenue: 0.0678
        }]
    }
    await route.fulfill({ json: [response]})
  })

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    if(route.request().method() == 'POST'){
        await route.fulfill({ json: orderRes })
    }else if(route.request().method() == 'GET'){
        await route.fulfill({ json: orderRes })
    }
  });

  // verify and order
  await page.route('**/api/order/verify', async (route) => {
    const message = 'valid';
    const payload = {
        "vendor": {
            "id": "m3k4e",
            "name": "Maguire"
        },
        "diner": {
            "id": 3,
            "name": "pizza franchisee",
            "email": "f@jwt.com"
        },
        "order": {
            "items": [
            {
                "menuId": 1,
                "description": "Veggie",
                "price": 0.0038
            }
            ],
            "storeId": "1",
            "franchiseId": 1,
            "id": 9
        }
    }
    await route.fulfill({ json: { payload: payload, message: message }});
  })

  await page.goto('/');
}