# ShopFlow Base Data Setup Guide

## Quick Start

This guide will help you set up the ShopFlow project with admin account and sample data for testing.

## Admin Credentials

- **Email:** `admin@shopflow.com`
- **Password:** `smrutimistry57`
- **Role:** Admin

## Setup Steps

### 1. Install Dependencies

```bash
# In the backend directory
npm install

# In the frontend directory (if needed)
npm install
```

### 2. Seed the Database with Base Data

Run the following command to create the admin user and populate sample data:

```bash
npm run seed
```

This will create:
- ✅ **1 Admin User** with email `admin@shopflow.com`
- ✅ **8 Sample Products** (Laptops, Accessories, Storage, Furniture)
- ✅ **5 Sample Customers** with detailed information
- ✅ **5 Sample Invoices** with invoice items and GST calculations

### 3. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 4. Start the Frontend

In a separate terminal, navigate to the frontend directory:

```bash
cd ../frontend
npm install
npm run dev
```

## Database Structure

### Admin User
- **ID:** 1 (auto-assigned)
- **Name:** Admin
- **Email:** admin@shopflow.com
- **Password:** smrutimistry57
- **Role:** admin

### Sample Products (8 items)
1. Laptop Pro 15 - ₹89,999
2. Wireless Mouse - ₹1,599
3. USB-C Hub - ₹3,499
4. Monitor 27" 4K - ₹34,999
5. Mechanical Keyboard - ₹8,999
6. External SSD 1TB - ₹12,999
7. Webcam HD - ₹4,999
8. Desk Lamp LED - ₹2,499

### Sample Customers (5 customers)
1. Rajesh Kumar - Mumbai (VIP)
2. Priya Sharma - Delhi (Regular)
3. Amit Patel - Bangalore (Regular)
4. Neha Singh - Pune (New)
5. Vikram Verma - Hyderabad (VIP)

### Sample Invoices
- 5 invoices with multiple items each
- GST calculations included (18% rate)
- Various payment methods: cash, card, UPI, bank transfer
- All marked as PAID status

## Available Commands

```bash
# Seed fresh data
npm run seed

# Clear all data from database (WARNING: Destructive)
npm run seed:clear

# Then reseed:
npm run seed

# Start backend server
npm start

# Start backend with auto-reload (development)
npm run dev
```

## Database File Location

The SQLite database file is stored at:
```
backend/database.sqlite
```

This file is created automatically when you run `npm run seed` for the first time.

## Login Instructions

1. Open the frontend in your browser (usually `http://localhost:5173`)
2. Navigate to the Login page
3. Enter credentials:
   - **Email:** `admin@shopflow.com`
   - **Password:** `smrutimistry57`
4. Click Login

## Features to Test

### After Login, you can test:

✅ **Dashboard** - View overview and analytics
✅ **Customers** - View, create, and manage customers
✅ **Products** - View, create, and manage products
✅ **Invoices** - View existing invoices and create new ones
✅ **Billing** - Generate invoices with items and GST
✅ **Reports** - View sales reports
✅ **Settings** - Manage account settings

## Troubleshooting

### Database Already Exists
If you get an error about existing data, clear the database first:
```bash
npm run seed:clear
npm run seed
```

### Port Already in Use
If port 3000 (backend) or 5173 (frontend) is already in use, you can:
- Stop other processes using those ports
- Or modify the port in the server configuration

### Missing Dependencies
Make sure you've run `npm install` in both backend and frontend directories.

## Notes

- The sample data is designed for testing all features
- All invoices include realistic GST calculations
- Customer tiers (New/Regular/VIP) are set based on sample data
- Products have various stock levels for inventory testing
- All data is stored locally in SQLite database

## Support

For issues or questions, refer to the project README.md file.
