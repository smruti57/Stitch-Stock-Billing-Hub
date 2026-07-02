# QuickStart - ShopFlow Base Data Setup

## In 3 Commands:

```bash
# 1. Install dependencies
npm install

# 2. Seed database with admin + sample data
npm run seed

# 3. Start the server
npm start
```

---

## Admin Login Credentials

```
Email:    admin@shopflow.com
Password: smrutimistry57
```

---

## What Gets Created

| Item | Count | Details |
|------|-------|---------|
| Admin User | 1 | admin@shopflow.com (Password: smrutimistry57) |
| Products | 8 | Electronics, Accessories, Storage, Furniture |
| Customers | 5 | Mumbai, Delhi, Bangalore, Pune, Hyderabad |
| Invoices | 5 | Complete with items and 18% GST calculations |
| Invoice Items | 13+ | Various products with quantities |

---

## Key Admin Features

✅ View Dashboard & Analytics  
✅ Manage Customers (Create, Edit, View)  
✅ Manage Products (Create, Edit, View)  
✅ Create & View Invoices  
✅ Generate Billing Reports  
✅ Configure Settings  

---

## Database & Storage

- **Database Type:** SQLite
- **Location:** `backend/database.sqlite`
- **Auto-created:** Yes (runs on first `npm run seed`)

---

## Sample Data Overview

### Products Include:
- Laptop Pro 15 (₹89,999)
- USB Accessories (₹1,600-₹4,999)
- Monitor 4K (₹34,999)
- External Storage (₹12,999)
- & More...

### Customers Include:
- VIP Tier: 2 customers
- Regular Tier: 2 customers
- New Tier: 1 customer
- All with GSTIN, Phone, Address

### Invoices Include:
- Invoice numbers: INV-0001 to INV-0005
- Payment methods: cash, card, UPI, bank_transfer
- Status: All PAID
- GST: 18% (CGST + SGST)

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run seed` | Create fresh base data |
| `npm run seed:clear` | Delete all data (WARNING!) |
| `npm start` | Run server (production) |
| `npm run dev` | Run server with auto-reload |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Data already exists" | Run `npm run seed:clear` then `npm run seed` |
| Port 3000 already in use | Stop other process or change port in config |
| Missing dependencies | Run `npm install` again |
| Database won't sync | Delete `database.sqlite` and try again |

---

## Next Steps

1. ✅ Run `npm run seed`
2. ✅ Run `npm start` (or `npm run dev`)
3. ✅ Open http://localhost:3000 (frontend)
4. ✅ Login with admin@shopflow.com / smrutimistry57
5. ✅ Start testing!

---

For detailed information, see **SETUP_GUIDE.md** in the backend directory.
