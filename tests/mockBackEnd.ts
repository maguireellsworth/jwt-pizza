import { test, expect, Page, Route } from '@playwright/test'
import { User, Role, Store } from '../src/service/pizzaService'

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
    'f@jwt.com': { id: '4', name: 'some name', email: 'f@jwt.com', password: 'franchisee', roles: [{role: Role.Franchisee}] },
    'a@jwt.com': { id: '5', name: 'some name', email: 'a@jwt.com', password: 'admin', roles: [{role: Role.Admin}] }
  };
  const mockUsers = [
    { id: 1,  name: 'Alice Johnson',    email: 'alice@jwt.com',    roles: [{ role: 'diner' }] },
    { id: 2,  name: 'Bob Smith',        email: 'bob@jwt.com',      roles: [{ role: 'diner' }] },
    { id: 3,  name: 'Charlie Brown',    email: 'charlie@jwt.com',  roles: [{ role: 'chef' }] },
    { id: 4,  name: 'Dana White',       email: 'dana@jwt.com',     roles: [{ role: 'admin' }] },
    { id: 5,  name: 'Ethan Clark',      email: 'ethan@jwt.com',    roles: [{ role: 'diner' }] },
    { id: 6,  name: 'Fiona Davis',      email: 'fiona@jwt.com',    roles: [{ role: 'diner' }] },
    { id: 7,  name: 'George Miller',    email: 'george@jwt.com',   roles: [{ role: 'chef' }] },
    { id: 8,  name: 'Hannah Lee',       email: 'hannah@jwt.com',   roles: [{ role: 'diner' }] },
    { id: 9,  name: 'Ian Thompson',     email: 'ian@jwt.com',      roles: [{ role: 'diner' }] },
    { id: 10, name: 'Julia Martinez',   email: 'julia@jwt.com',    roles: [{ role: 'admin' }] },
    { id: 11, name: 'Kevin Anderson',   email: 'kevin@jwt.com',    roles: [{ role: 'diner' }] },
    { id: 12, name: 'Laura Garcia',     email: 'laura@jwt.com',    roles: [{ role: 'chef' }] },
    { id: 13, name: 'Michael Wilson',   email: 'michael@jwt.com',  roles: [{ role: 'diner' }] },
    { id: 14, name: 'Nina Rodriguez',   email: 'nina@jwt.com',     roles: [{ role: 'diner' }] },
    { id: 15, name: 'Oliver Martinez',  email: 'oliver@jwt.com',   roles: [{ role: 'admin' }] },
    { id: 16, name: 'Paula Hernandez',  email: 'paula@jwt.com',    roles: [{ role: 'diner' }] },
    { id: 17, name: 'Quentin Scott',    email: 'quentin@jwt.com',  roles: [{ role: 'chef' }] },
    { id: 18, name: 'Rachel Young',     email: 'rachel@jwt.com',   roles: [{ role: 'diner' }] },
    { id: 19, name: 'Samuel King',      email: 'samuel@jwt.com',   roles: [{ role: 'diner' }] },
    { id: 20, name: 'Tina Wright',      email: 'tina@jwt.com',     roles: [{ role: 'admin' }] },
    { id: 21, name: 'Ulysses Hall',     email: 'ulysses@jwt.com',  roles: [{ role: 'diner' }] },
    { id: 22, name: 'Victoria Allen',   email: 'victoria@jwt.com', roles: [{ role: 'chef' }] },
    { id: 23, name: 'William Green',    email: 'william@jwt.com',  roles: [{ role: 'diner' }] },
    { id: 24, name: 'Xavier Adams',     email: 'xavier@jwt.com',   roles: [{ role: 'diner' }] },
    { id: 25, name: 'Yasmine Baker',    email: 'yasmine@jwt.com',  roles: [{ role: 'admin' }] },
  ];


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

  let nextId = 6;

  await page.route('**/api/auth', async (route) => {
    const method = route.request().method();
    const body = route.request().postDataJSON() ?? {};

    // REGISTER
    if (method === 'POST') {
      const email = body.email;
      const password = body.password;
      const name = body.name ?? body.fullName;

      if (!email || !password || !name) {
        await route.fulfill({ status: 400 });
        return;
      }

      if (validUsers[email]) {
        await route.fulfill({ status: 409 });
        return;
      }

      nextId++;
      const user: User = {
        id: nextId.toString(),
        name,
        email,
        roles: [{ role: Role.Diner }],
      };

      validUsers[email] = { ...user, password };
      loggedInUser = user;
    const registerResp = {
      user: loggedInUser,
      token: 'abcdef',
    };
      await route.fulfill({ json: registerResp });
      return;
    }
     // LOGIN
    if (method === 'PUT') {
      const email = body.email;
      const password = body.password;

      const user = validUsers[email];
      if (!user || user.password !== password) {
        await route.fulfill({ status: 401 });
        return;
      }

      loggedInUser = user;
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      await route.fulfill({ json: loginRes });
      return;
    }

      // LOGOUT
    if (method === 'DELETE') {
      loggedInUser = undefined;
      await route.fulfill({ json: {message: 'logout successful'}});
      return;
    }

    await route.continue();
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // Update an existing user
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    const method = route.request().method();
    const body = route.request().postDataJSON() ?? {};
    const url = new URL(route.request().url());
    let userId: Number | String = Number(url.pathname.split('/').pop());
    userId = userId.toString();

    if(method == 'PUT'){
      const existingEntry = Object.entries(validUsers).find(
        ([_, user]) => user.id === userId
      );
      if(!existingEntry){
        await route.fulfill({status: 404});
        return;
      }

      const [oldEmail, existingUser] = existingEntry;
      if(body.email && body.email !== oldEmail){
        delete validUsers[oldEmail];
      }
      const updatedUser = {
        ...existingUser,
        ...body,
        id: existingUser.id,
      }
      validUsers[updatedUser.email] = updatedUser;


      loggedInUser = {...updatedUser};
      delete loggedInUser!.password;
      await route.fulfill({ json: {
        email: updatedUser.email,
        roles:[updatedUser.roles[0]]
      }})
    }
  })

  // GET /api/user?page=1&limit=10&name=*
await page.route(/\/api\/user(\?.*)?$/, async (route) => {
  if (route.request().method() !== 'GET') {
    await route.continue();
    return;
  }

  const url = new URL(route.request().url());

  const page = Number(url.searchParams.get('page') ?? 1);
  const limit = Number(url.searchParams.get('limit') ?? 10);
  const nameFilter = url.searchParams.get('name') ?? '*';

  let filtered = mockUsers;

  if (nameFilter !== '*' && nameFilter.trim() !== '') {
    const normalized = nameFilter.replace(/^\*+|\*+$/g, '').toLowerCase();
    filtered = mockUsers.filter((u) =>
      u.name.toLowerCase().includes(normalized)
    );
  }

  const start = (page) * limit;
  const end = start + limit;

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      users: filtered.slice(start, end),
      more: end < filtered.length,
    }),
  });
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