(async () => {
  try {
    const base = 'http://127.0.0.1:5000/api';
    const loginRes = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@shopflow.in', password: 'Demo@1234' }),
    });
    const login = await loginRes.json();
    console.log('LOGIN STATUS', loginRes.status);
    console.log('LOGIN BODY', login);
    const token = login.token;

    const customer = { name: 'Scripted Test', email: 'scripted_test@example.com', phone: '+911234567891' };
    const createRes = await fetch(base + '/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(customer),
    });
    const created = await createRes.json();
    console.log('CREATE STATUS', createRes.status);
    console.log('CREATE BODY', created);

    const listRes = await fetch(base + '/customers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const list = await listRes.json();
    console.log('LIST STATUS', listRes.status);
    console.log('LIST COUNT', list.total);
    console.log('FIRST 3 CUSTOMERS', list.customers && list.customers.slice(0,3));
  } catch (e) {
    console.error('ERROR', e);
  }
})();
