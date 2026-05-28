# ShopFlow Backend — Node.js + Express + MongoDB

Production-ready REST API for ShopFlow built with the MERN stack.
Includes JWT auth, inventory, customer CRM, GST billing, and PDF invoice generation.

---

## Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Runtime        | Node.js 20                     |
| Framework      | Express.js 4                   |
| Database       | MongoDB 7 via Mongoose 8       |
| Auth           | JWT (jsonwebtoken) + bcryptjs  |
| PDF Generation | PDFKit                         |
| Container      | Docker + docker-compose        |

---

## Quick Start

### Option A — Docker (recommended)

```bash
# 1. Clone / unzip the project
cd shopflow_node

# 2. Create env file
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 3. Start everything
docker-compose up --build
```

API live at → **http://localhost:5000**

---

### Option B — Local (without Docker)

```bash
# Requires MongoDB running locally on port 27017
cd shopflow_node
npm install

# Create .env
cp .env.example .env
# Set MONGO_URI=mongodb://localhost:27017/shopflow

npm run dev      # development with nodemon
# or
npm start        # production
```

---

## Project Structure

```
shopflow_node/
├── config/
│   └── db.js                   Mongoose connection
├── models/
│   ├── User.js                 Schema + bcrypt + matchPassword()
│   ├── Product.js              Schema + virtual status field
│   ├── Customer.js             Schema + tier tracking
│   └── Invoice.js              Schema with customer snapshot + line items
├── routes/
│   ├── authRoutes.js           /api/auth/*
│   ├── productRoutes.js        /api/products/*
│   ├── customerRoutes.js       /api/customers/*
│   └── invoiceRoutes.js        /api/invoices/*
├── middleware/
│   └── authMiddleware.js       JWT protect + role authorise
├── utils/
│   ├── gst.js                  Indian GST calculator (CGST + SGST)
│   └── generateInvoice.js      PDFKit invoice generator
├── server.js                   App entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## API Reference

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth — `/api/auth`

| Method | Endpoint           | Auth | Description           |
|--------|--------------------|------|-----------------------|
| POST   | `/auth/register`   | ❌   | Register new merchant |
| POST   | `/auth/login`      | ❌   | Login, get JWT        |
| GET    | `/auth/me`         | ✅   | Get current profile   |

**Register**
```json
POST /api/auth/register
{
  "name": "Aarav Mehta",
  "email": "aarav@shopflow.in",
  "password": "securepassword"
}
```

**Response**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Aarav Mehta", "email": "...", "role": "merchant" }
}
```

---

### Inventory — `/api/products`

| Method | Endpoint                 | Description                 |
|--------|--------------------------|-----------------------------|
| POST   | `/products`              | Add product                 |
| GET    | `/products`              | List all (search + filter)  |
| GET    | `/products/low-stock`    | Stock ≤ 10                  |
| GET    | `/products/:id`          | Get single product          |
| PUT    | `/products/:id`          | Update product              |
| DELETE | `/products/:id`          | Soft-delete product         |

**Add Product**
```json
POST /api/products
{
  "name": "Silk Pocket Square",
  "sku": "ACC-042",
  "category": "Accessories",
  "price": 120.00,
  "stock": 45,
  "description": "100% mulberry silk"
}
```

**Query Params (GET /products)**
- `search` — name or SKU substring
- `category` — exact match (case-insensitive)
- `lowStock=true` — only items with stock ≤ 10
- `skip`, `limit` — pagination

---

### Customers — `/api/customers`

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| POST   | `/customers`                   | Add customer             |
| GET    | `/customers`                   | List all                 |
| GET    | `/customers/:id`               | Get single customer      |
| GET    | `/customers/:id/transactions`  | All invoices for customer|
| PUT    | `/customers/:id`               | Update customer          |
| DELETE | `/customers/:id`               | Soft-delete customer     |

**Add Customer**
```json
POST /api/customers
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 91234 56789",
  "address": "Mumbai, Maharashtra",
  "gstin": "27AAPFU0939F1ZV"
}
```

Customer tiers update automatically with each invoice:
- **New** → 0–4 orders
- **Regular** → 5–9 orders
- **VIP** → 10+ orders

---

### Billing — `/api/invoices`

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/invoices`                   | Create invoice (GST auto-calc) |
| GET    | `/invoices`                   | List all invoices              |
| GET    | `/invoices/stats/dashboard`   | Dashboard KPIs                 |
| GET    | `/invoices/:id`               | Get single invoice             |
| PUT    | `/invoices/:id`               | Update status / notes          |
| POST   | `/invoices/:id/void`          | Void invoice                   |
| GET    | `/invoices/:id/pdf`           | **Download PDF**               |

**Create Invoice**
```json
POST /api/invoices
{
  "customerId": "<mongo_id>",
  "items": [
    { "name": "Silk Pocket Square", "sku": "ACC-042", "quantity": 2, "price": 120.00 },
    { "name": "Calfskin Belt",       "sku": "LTH-003", "quantity": 1, "price": 210.00 }
  ],
  "paymentMethod": "upi",
  "discount": 0,
  "notes": "VIP order"
}
```

**Invoice Response (GST breakdown)**
```json
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-0001",
    "subtotal": 450.00,
    "discount": 0.00,
    "gstRate": 0.18,
    "cgst": 40.50,
    "sgst": 40.50,
    "gstAmount": 81.00,
    "total": 531.00,
    "status": "PAID"
  }
}
```

GST split: **CGST 9% + SGST 9%** (intra-state retail default)

---

### PDF Invoice

```
GET /api/invoices/:id/pdf
Authorization: Bearer <token>
```

Returns a downloadable A4 PDF with:
- ShopFlow branded header (navy + brass)
- Customer details + GSTIN
- Itemised table with SKU
- GST breakdown (CGST + SGST)
- Grand total
- Payment method

---

### Dashboard Stats

```
GET /api/invoices/stats/dashboard
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "totalSKUs": 310,
  "lowStockCount": 13,
  "todaySales": 4600.00,
  "pendingBills": 2
}
```

---

## Environment Variables

| Variable          | Default                              | Description              |
|-------------------|--------------------------------------|--------------------------|
| `PORT`            | `5000`                               | Server port              |
| `NODE_ENV`        | `development`                        | Environment              |
| `MONGO_URI`       | `mongodb://mongo:27017/shopflow`     | MongoDB connection string |
| `JWT_SECRET`      | *(required)*                         | Token signing secret     |
| `JWT_EXPIRES_IN`  | `24h`                                | Token TTL                |
| `GST_RATE`        | `0.18`                               | GST rate (18%)           |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Docker Commands

```bash
# Start (foreground)
docker-compose up --build

# Start (background)
docker-compose up -d --build

# Stop
docker-compose down

# View backend logs
docker-compose logs -f backend

# View MongoDB logs
docker-compose logs -f mongo

# Restart backend only
docker-compose restart backend
```

---

## Health Check

```bash
curl http://localhost:5000/health
# { "status": "ok", "database": "connected", "uptime": "12.3s" }
```

---

## Production Checklist

- [ ] Set a long random `JWT_SECRET` (64+ chars)
- [ ] Remove the dev volume mount `- .:/app` from `docker-compose.yml`
- [ ] Set `NODE_ENV=production` in docker-compose environment
- [ ] Add MongoDB auth (`MONGO_INITDB_ROOT_USERNAME` / `PASSWORD`)
- [ ] Put nginx/Caddy in front as a reverse proxy
- [ ] Enable HTTPS at the proxy layer
- [ ] Restrict CORS `origin` to your frontend domain only
