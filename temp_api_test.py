import json, urllib.request

def req(path, method='GET', data=None, token=None):
    url = 'http://127.0.0.1:5000' + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
    r = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r, timeout=10) as f:
            return json.loads(f.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('ERR', e.code, e.read().decode('utf-8'))
        return None

login = req('/api/auth/login', 'POST', {'email': 'testuser123@example.com', 'password': 'TestPass123!'})
print('login=', login)

token = login['token']

customer = req('/api/customers', 'POST', {
    'name': 'Rahul Jain',
    'email': 'rahul.jain@example.com',
    'phone': '+919876543210',
    'address': '1 MG Road, Mumbai',
    'gstin': '27AAAAB1111C1Z2'
}, token=token)
print('customer=', customer)

product = req('/api/products', 'POST', {
    'name': 'Premium Notebook',
    'sku': 'STAT-001',
    'category': 'Stationery',
    'price': 350,
    'stock': 30,
    'description': 'Hardcover 200 pages'
}, token=token)
print('product=', product)

print('customers list=', req('/api/customers', token=token))
print('products list=', req('/api/products', token=token))

if customer and product:
    customer_id = customer.get('customer', {}).get('id') if 'customer' in customer else customer.get('id')
    product_obj = product.get('product', product)
    invoice = req('/api/invoices', 'POST', {
        'customerId': customer_id,
        'items': [{'productId': product_obj['id'], 'sku': product_obj['sku'], 'name': product_obj['name'], 'quantity': 2, 'unitPrice': product_obj['price']}],
        'paymentMethod': 'card',
        'discount': 50,
        'notes': 'Sample invoice'
    }, token=token)
    print('invoice=', invoice)
