// seed_base_data.js — ShopFlow Base Data Seeder (SQLite)
// Run:   node seed_base_data.js
// Clear: node seed_base_data.js --clear

require("dotenv").config();
const { sequelize } = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const { Invoice, InvoiceItem } = require("./models/Invoice");
const bcrypt = require("bcryptjs");

const getNextInvoiceNumber = async () => {
  const existing = await Invoice.findAll({ attributes: ["invoiceNumber"], raw: true });
  const used = new Set(existing.map((inv) => inv.invoiceNumber));
  for (let i = 1; ; i += 1) {
    const invoiceNumber = `INV-${String(i).padStart(4, "0")}`;
    if (!used.has(invoiceNumber)) return invoiceNumber;
  }
};

// ── Colors ─────────────────────────────────────────────────────
const C = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};
const log  = (s) => console.log(C.green("✔  ") + s);
const info = (s) => console.log(C.cyan("ℹ  ") + s);
const warn = (s) => console.log(C.yellow("⚠  ") + s);
const err  = (s) => console.log(C.red("✘  ") + s);
const head = (s) => console.log(`\n${C.bold(C.cyan("── " + s + " ──"))}`);
const line = ()  => console.log(C.dim("─".repeat(60)));

// ── Main seeding function ──────────────────────────────────────
const seedData = async () => {
  try {
    head("ShopFlow Base Data Seeder");

    // Connect to database
    info("Connecting to database...");
    await sequelize.authenticate();
    log("Database connected successfully");

    // Sync models
    info("Syncing database models...");
    await sequelize.sync();
    log("All models synced");
    line();

    // Check for --clear flag
    if (process.argv.includes("--clear")) {
      head("Clearing all data");
      await Promise.all([
        InvoiceItem.destroy({ where: {} }),
        Invoice.destroy({ where: {} }),
        Customer.destroy({ where: {} }),
        Product.destroy({ where: {} }),
        User.destroy({ where: {} }),
      ]);
      log("All data cleared");
      info("Run again without --clear to seed fresh data");
      line();
      process.exit(0);
    }

    // ────────────────────────────────────────────────────────
    // 1. Create Admin User
    // ────────────────────────────────────────────────────────
    head("Creating Admin User");

    let admin = await User.findOne({ where: { email: "admin@shopflow.com" } });
    if (admin) {
      warn(`Admin user already exists (ID: ${admin.id})`);
    } else {
      admin = await User.create({
        name: "Admin",
        email: "admin@shopflow.com",
        password: "smrutimistry57",
        role: "admin",
        isActive: true,
      });
      log(`Admin user created successfully (ID: ${admin.id})`);
      info(`Email: admin@shopflow.com | Password: smrutimistry57`);
    }
    line();

    // ────────────────────────────────────────────────────────
    // 2. Create Sample Products
    // ────────────────────────────────────────────────────────
    head("Creating Sample Products");

    const productData = [
      {
        name: "Laptop Pro 15",
        sku: "LAPTOP-001",
        category: "Electronics",
        price: 89999,
        stock: 15,
        description: "High-performance laptop with 16GB RAM and 512GB SSD",
      },
      {
        name: "Wireless Mouse",
        sku: "MOUSE-001",
        category: "Accessories",
        price: 1599,
        stock: 50,
        description: "Ergonomic wireless mouse with 2.4GHz receiver",
      },
      {
        name: "USB-C Hub",
        sku: "HUB-001",
        category: "Accessories",
        price: 3499,
        stock: 30,
        description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
      },
      {
        name: "Monitor 27 inch 4K",
        sku: "MON-001",
        category: "Electronics",
        price: 34999,
        stock: 8,
        description: "4K Ultra HD monitor with HDR support",
      },
      {
        name: "Mechanical Keyboard",
        sku: "KEY-001",
        category: "Accessories",
        price: 8999,
        stock: 25,
        description: "RGB mechanical keyboard with Cherry MX switches",
      },
      {
        name: "External SSD 1TB",
        sku: "SSD-001",
        category: "Storage",
        price: 12999,
        stock: 20,
        description: "Portable 1TB external SSD with USB 3.1",
      },
      {
        name: "Webcam HD",
        sku: "WEB-001",
        category: "Accessories",
        price: 4999,
        stock: 18,
        description: "1080p HD webcam with built-in microphone",
      },
      {
        name: "Desk Lamp LED",
        sku: "LAMP-001",
        category: "Furniture",
        price: 2499,
        stock: 35,
        description: "Adjustable LED desk lamp with touch control",
      },
    ];

    const products = [];
    for (const prod of productData) {
      let existing = await Product.findOne({ where: { sku: prod.sku } });
      if (existing) {
        warn(`Product ${prod.sku} already exists (ID: ${existing.id})`);
        products.push(existing);
      } else {
        const created = await Product.create({
          ownerId: admin.id,
          ...prod,
          isActive: true,
        });
        log(`Product created: ${created.name} (ID: ${created.id})`);
        products.push(created);
      }
    }
    line();

    // ────────────────────────────────────────────────────────
    // 3. Create Sample Customers
    // ────────────────────────────────────────────────────────
    head("Creating Sample Customers");

    const customerData = [
      {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "9876543210",
        address: "123 Main Street, Mumbai, Maharashtra 400001",
        gstin: "27AABCT1234H1Z0",
        tier: "VIP",
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "9123456789",
        address: "456 Oak Avenue, Delhi, Delhi 110001",
        gstin: "07AABCS1234H1Z0",
        tier: "Regular",
      },
      {
        name: "Amit Patel",
        email: "amit.patel@example.com",
        phone: "9988776655",
        address: "789 Pine Road, Bangalore, Karnataka 560001",
        gstin: "29AABCP1234H1Z0",
        tier: "Regular",
      },
      {
        name: "Neha Singh",
        email: "neha.singh@example.com",
        phone: "9555666777",
        address: "321 Elm Street, Pune, Maharashtra 411001",
        gstin: "27AABCN1234H1Z0",
        tier: "New",
      },
      {
        name: "Vikram Verma",
        email: "vikram.verma@example.com",
        phone: "9444555666",
        address: "654 Birch Lane, Hyderabad, Telangana 500001",
        gstin: "36AABCV1234H1Z0",
        tier: "VIP",
      },
    ];

    const customers = [];
    for (const cust of customerData) {
      let existing = await Customer.findOne({ where: { email: cust.email } });
      if (existing) {
        warn(`Customer ${cust.email} already exists (ID: ${existing.id})`);
        customers.push(existing);
      } else {
        const created = await Customer.create({
          ownerId: admin.id,
          ...cust,
          isActive: true,
        });
        log(`Customer created: ${created.name} (ID: ${created.id})`);
        customers.push(created);
      }
    }
    line();

    // ────────────────────────────────────────────────────────
    // 4. Create Sample Invoices with Items
    // ────────────────────────────────────────────────────────
    head("Creating Sample Invoices");

    const invoiceConfigs = [
      {
        customer: customers[0],
        items: [
          { product: products[0], quantity: 1 },
          { product: products[1], quantity: 2 },
          { product: products[2], quantity: 1 },
        ],
        paymentMethod: "bank_transfer",
        discount: 5000,
      },
      {
        customer: customers[1],
        items: [
          { product: products[3], quantity: 1 },
          { product: products[4], quantity: 1 },
        ],
        paymentMethod: "card",
        discount: 0,
      },
      {
        customer: customers[2],
        items: [
          { product: products[5], quantity: 2 },
          { product: products[6], quantity: 1 },
        ],
        paymentMethod: "upi",
        discount: 2000,
      },
      {
        customer: customers[3],
        items: [
          { product: products[1], quantity: 3 },
          { product: products[7], quantity: 2 },
        ],
        paymentMethod: "cash",
        discount: 0,
      },
      {
        customer: customers[4],
        items: [
          { product: products[0], quantity: 1 },
          { product: products[3], quantity: 1 },
          { product: products[5], quantity: 1 },
        ],
        paymentMethod: "card",
        discount: 8000,
      },
    ];

    for (let idx = 0; idx < invoiceConfigs.length; idx++) {
      const config = invoiceConfigs[idx];
      const customer = config.customer;

      // Calculate subtotal and taxes
      let subtotal = 0;
      for (const item of config.items) {
        subtotal += item.product.price * item.quantity;
      }

      const discount = config.discount || 0;
      const gstRate = 0.18; // 18% GST
      const taxableAmount = subtotal - discount;
      const gstAmount = Math.round(taxableAmount * gstRate * 100) / 100;
      const cgst = Math.round((gstAmount / 2) * 100) / 100;
      const sgst = Math.round((gstAmount / 2) * 100) / 100;
      const total = taxableAmount + gstAmount;

      // Generate invoice number
      let invoiceNumber = `INV-${String(idx + 1).padStart(4, "0")}`;

      // Check if invoice number already exists
      const existingInvoice = await Invoice.findOne({ where: { invoiceNumber } });
      if (existingInvoice) {
        if (existingInvoice.ownerId === admin.id) {
          warn(`Invoice ${invoiceNumber} already exists for admin (ID: ${existingInvoice.id})`);
          continue;
        }
        const nextInvoice = await getNextInvoiceNumber();
        warn(`Invoice number ${invoiceNumber} is used by another owner. Creating admin invoice as ${nextInvoice}.`);
        invoiceNumber = nextInvoice;
      }

      // Create invoice
      const invoiceDate = new Date();
      invoiceDate.setDate(invoiceDate.getDate() - idx * 2);
      invoiceDate.setHours(10 + idx, 0, 0, 0);

      const invoice = await Invoice.create({
        ownerId: admin.id,
        customerId: customer.id,
        invoiceNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerGstin: customer.gstin,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: discount,
        gstRate: gstRate,
        cgst: cgst,
        sgst: sgst,
        gstAmount: gstAmount,
        total: Math.round(total * 100) / 100,
        paymentMethod: config.paymentMethod,
        status: "PAID",
        notes: `Sample invoice for testing - Invoice #${idx + 1}`,
        createdAt: invoiceDate,
        updatedAt: invoiceDate,
      });

      // Create invoice items
      for (const itemConfig of config.items) {
        const product = itemConfig.product;
        const quantity = itemConfig.quantity;
        const itemTotal = Math.round(product.price * quantity * 100) / 100;

        await InvoiceItem.create({
          invoiceId: invoice.id,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          quantity,
          unitPrice: product.price,
          total: itemTotal,
        });
      }

      log(
        `Invoice created: ${invoiceNumber} | Customer: ${customer.name} | Total: ₹${invoice.total} (ID: ${invoice.id})`
      );

      // Update customer stats
      await customer.increment("totalOrders");
      await customer.increment("totalSpent", { by: invoice.total });
    }
    line();

    // ────────────────────────────────────────────────────────
    // 5. Summary
    // ────────────────────────────────────────────────────────
    head("Seeding Complete - Summary");

    const userCount = await User.count();
    const productCount = await Product.count();
    const customerCount = await Customer.count();
    const invoiceCount = await Invoice.count();
    const invoiceItemCount = await InvoiceItem.count();

    info(`Total Users: ${userCount}`);
    info(`Total Products: ${productCount}`);
    info(`Total Customers: ${customerCount}`);
    info(`Total Invoices: ${invoiceCount}`);
    info(`Total Invoice Items: ${invoiceItemCount}`);
    line();

    log("✅  Base data seeded successfully!");
    info(`Admin Email: admin@shopflow.com`);
    info(`Admin Password: smrutimistry57`);
    info(`Admin ID: ${admin.id}`);
    line();
    info("You can now run: npm start");
    line();

    process.exit(0);
  } catch (error) {
    err(`Error during seeding: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// ── Execute seeding ────────────────────────────────────────────
seedData();
