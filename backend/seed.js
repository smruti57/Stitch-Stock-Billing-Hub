// seed.js — ShopFlow MySQL Demo Data Seeder
// Run:   node seed.js
// Clear: node seed.js --clear
// Fresh: node seed.js --fresh

require("dotenv").config();
const { Sequelize, DataTypes, Op } = require("sequelize");
const bcrypt = require("bcryptjs");

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
const line = ()  => console.log(C.dim("─".repeat(55)));

// ── Sequelize connection ───────────────────────────────────────
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "shopflow",
  process.env.MYSQL_USER     || "shopflow_user",
  process.env.MYSQL_PASSWORD || "shopflow_pass",
  {
    host:    process.env.MYSQL_HOST || "localhost",
    port:    process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

// ── Define models inline (mirrors your real models) ───────────
const User = sequelize.define("User", {
  name:     DataTypes.STRING,
  email:    { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role:     { type: DataTypes.ENUM("merchant","admin"), defaultValue: "merchant" },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "users" });

const Product = sequelize.define("Product", {
  ownerId:     DataTypes.INTEGER,
  name:        DataTypes.STRING,
  sku:         DataTypes.STRING,
  category:    DataTypes.STRING,
  price:       DataTypes.DECIMAL(10,2),
  stock:       DataTypes.INTEGER,
  description: DataTypes.TEXT,
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "products" });

const Customer = sequelize.define("Customer", {
  ownerId:     DataTypes.INTEGER,
  name:        DataTypes.STRING,
  email:       DataTypes.STRING,
  phone:       DataTypes.STRING,
  address:     DataTypes.TEXT,
  gstin:       DataTypes.STRING,
  tier:        { type: DataTypes.ENUM("New","Regular","VIP"), defaultValue: "New" },
  totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent:  { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "customers" });

const Invoice = sequelize.define("Invoice", {
  ownerId:         DataTypes.INTEGER,
  customerId:      DataTypes.INTEGER,
  invoiceNumber:   { type: DataTypes.STRING, unique: true },
  customerName:    DataTypes.STRING,
  customerEmail:   DataTypes.STRING,
  customerPhone:   DataTypes.STRING,
  customerAddress: DataTypes.TEXT,
  customerGstin:   DataTypes.STRING,
  subtotal:        DataTypes.DECIMAL(12,2),
  discount:        { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  gstRate:         { type: DataTypes.DECIMAL(5,4),  defaultValue: 0.18 },
  cgst:            DataTypes.DECIMAL(12,2),
  sgst:            DataTypes.DECIMAL(12,2),
  gstAmount:       DataTypes.DECIMAL(12,2),
  total:           DataTypes.DECIMAL(12,2),
  paymentMethod:   { type: DataTypes.ENUM("cash","card","upi","bank_transfer"), defaultValue: "cash" },
  status:          { type: DataTypes.ENUM("PAID","PENDING","VOID"), defaultValue: "PAID" },
  notes:           DataTypes.TEXT,
}, { tableName: "invoices" });

const InvoiceItem = sequelize.define("InvoiceItem", {
  invoiceId: DataTypes.INTEGER,
  productId: DataTypes.INTEGER,
  sku:       DataTypes.STRING,
  name:      DataTypes.STRING,
  quantity:  DataTypes.INTEGER,
  unitPrice: DataTypes.DECIMAL(10,2),
  total:     DataTypes.DECIMAL(12,2),
}, { tableName: "invoice_items", timestamps: false });

// ── GST calculator ─────────────────────────────────────────────
const calcGST = (subtotal, discount = 0, rate = 0.18) => {
  const taxable   = Math.max(0, subtotal - discount);
  const gstAmount = parseFloat((taxable * rate).toFixed(2));
  const half      = parseFloat((gstAmount / 2).toFixed(2));
  return {
    subtotal:  parseFloat(subtotal.toFixed(2)),
    discount:  parseFloat(discount.toFixed(2)),
    taxable:   parseFloat(taxable.toFixed(2)),
    gstRate:   rate,
    cgst:      half,
    sgst:      half,
    gstAmount,
    total:     parseFloat((taxable + gstAmount).toFixed(2)),
  };
};

// ══════════════════════════════════════════════════════════════
// SEED DATA
// ══════════════════════════════════════════════════════════════

const DEMO_USER = {
  name: "Aarav Mehta",
  email: "demo@shopflow.in",
  password: "Demo@1234",
};

const PRODUCTS = [
  { name: "Luxury Silk Pocket Square",  sku: "ACC-001", category: "Accessories",   price: 120,  stock: 45, description: "100% mulberry silk, hand-rolled edges"         },
  { name: "Lunar Chronograph Watch",    sku: "ACC-002", category: "Accessories",   price: 5800, stock: 12, description: "Stainless steel, sapphire crystal glass"         },
  { name: "Leather Card Holder",        sku: "ACC-003", category: "Accessories",   price: 350,  stock: 60, description: "Full-grain vegetable tanned leather"             },
  { name: "Canvas Weekend Bag",         sku: "ACC-004", category: "Accessories",   price: 1200, stock: 8,  description: "Waxed canvas with brass hardware"               },
  { name: "Heritage Leather Bag",       sku: "ACC-005", category: "Accessories",   price: 2450, stock: 5,  description: "Full-grain leather, hand-stitched"              },
  { name: "Slim Fit Oxford Shirt",      sku: "APR-001", category: "Apparel",       price: 1450, stock: 58, description: "140s two-ply cotton poplin"                     },
  { name: "Merino Turtleneck Sweater",  sku: "APR-002", category: "Apparel",       price: 1850, stock: 22, description: "Extra-fine 18.5 micron merino wool"             },
  { name: "Cashmere Scarf",             sku: "APR-003", category: "Apparel",       price: 1650, stock: 30, description: "Grade A Mongolian cashmere, 180cm"              },
  { name: "Slim Chino Trousers",        sku: "APR-004", category: "Apparel",       price: 1980, stock: 40, description: "Stretch cotton twill, tapered fit"              },
  { name: "Linen Blazer",              sku: "APR-005", category: "Apparel",       price: 3200, stock: 3,  description: "Pure Irish linen, half-canvas construction"     },
  { name: "Italian Calfskin Belt",      sku: "LTH-001", category: "Leather Goods", price: 2100, stock: 8,  description: "Box calf leather, solid brass buckle"           },
  { name: "Bifold Leather Wallet",      sku: "LTH-002", category: "Leather Goods", price: 950,  stock: 35, description: "Nappa leather, 8 card slots"                   },
  { name: "Leather Passport Cover",     sku: "LTH-003", category: "Leather Goods", price: 680,  stock: 25, description: "Smooth calf leather, gold foil stamp"           },
  { name: "Suede Chelsea Boots",        sku: "FTW-001", category: "Footwear",      price: 3100, stock: 6,  description: "Italian suede, leather sole"                   },
  { name: "Oxford Leather Shoes",       sku: "FTW-002", category: "Footwear",      price: 4200, stock: 4,  description: "Calf leather, Goodyear welted"                 },
  { name: "Premium Loafers",           sku: "FTW-003", category: "Footwear",      price: 2800, stock: 9,  description: "Burnished calf leather, leather lining"         },
];

const CUSTOMERS = [
  { name: "Rohan Kapoor",  email: "rohan@example.com",  phone: "+91 98765 43210", address: "42 Marine Lines, Mumbai, MH",          gstin: "27AAPFU0939F1ZV", totalOrders: 12, totalSpent: 48200, tier: "VIP"     },
  { name: "Priya Sharma",  email: "priya@example.com",  phone: "+91 91234 56789", address: "15 Park Street, Kolkata, WB",           gstin: "",               totalOrders: 5,  totalSpent: 18500, tier: "Regular" },
  { name: "Dev Bose",      email: "dev@example.com",    phone: "+91 88001 11234", address: "8 MG Road, Bengaluru, KA",              gstin: "29GGGGG1314R9Z6", totalOrders: 3,  totalSpent: 9800,  tier: "New"     },
  { name: "Nisha Patel",   email: "nisha@example.com",  phone: "+91 70099 88765", address: "33 CG Road, Ahmedabad, GJ",             gstin: "24AAAAA0000A1Z5", totalOrders: 7,  totalSpent: 24600, tier: "Regular" },
  { name: "Sanya Iyer",    email: "sanya@example.com",  phone: "+91 97001 23456", address: "12 Anna Salai, Chennai, TN",            gstin: "",               totalOrders: 15, totalSpent: 62000, tier: "VIP"     },
  { name: "Arjun Nair",    email: "arjun@example.com",  phone: "+91 94400 55678", address: "7 Connaught Place, New Delhi",          gstin: "07BBBBB1234B1Z1", totalOrders: 2,  totalSpent: 5400,  tier: "New"     },
  { name: "Meera Joshi",   email: "meera@example.com",  phone: "+91 99887 76543", address: "5 FC Road, Pune, MH",                  gstin: "",               totalOrders: 8,  totalSpent: 31200, tier: "Regular" },
  { name: "Karan Verma",   email: "karan@example.com",  phone: "+91 85001 44321", address: "9 Sector 17, Chandigarh, PB",          gstin: "",               totalOrders: 1,  totalSpent: 1200,  tier: "New"     },
];

// Invoice templates — productIdx maps to PRODUCTS array above
const INVOICE_TEMPLATES = [
  { custIdx: 0, method: "card",         discount: 0,   status: "PAID",    daysAgo: 0, notes: "VIP client — priority packaging",
    lines: [{ pIdx: 0, qty: 2 }, { pIdx: 10, qty: 1 }] },
  { custIdx: 1, method: "upi",          discount: 100, status: "PAID",    daysAgo: 0, notes: "",
    lines: [{ pIdx: 5, qty: 1 }, { pIdx: 7,  qty: 1 }] },
  { custIdx: 2, method: "card",         discount: 0,   status: "PAID",    daysAgo: 1, notes: "Gift wrapping requested",
    lines: [{ pIdx: 1, qty: 1 }, { pIdx: 11, qty: 1 }] },
  { custIdx: 3, method: "cash",         discount: 0,   status: "PENDING", daysAgo: 1, notes: "",
    lines: [{ pIdx: 6, qty: 1 }] },
  { custIdx: 4, method: "upi",          discount: 200, status: "PAID",    daysAgo: 2, notes: "Regular customer discount",
    lines: [{ pIdx: 4, qty: 1 }, { pIdx: 12, qty: 1 }] },
  { custIdx: 5, method: "bank_transfer",discount: 500, status: "PAID",    daysAgo: 3, notes: "Corporate bulk order",
    lines: [{ pIdx: 9, qty: 1 }, { pIdx: 8,  qty: 1 }, { pIdx: 0, qty: 3 }] },
  { custIdx: 6, method: "card",         discount: 0,   status: "PAID",    daysAgo: 4, notes: "",
    lines: [{ pIdx: 13, qty: 1 }, { pIdx: 10, qty: 1 }] },
  { custIdx: 7, method: "cash",         discount: 0,   status: "PENDING", daysAgo: 5, notes: "Birthday gift set",
    lines: [{ pIdx: 2,  qty: 2 }, { pIdx: 12, qty: 1 }] },
  { custIdx: 0, method: "card",         discount: 300, status: "PAID",    daysAgo: 6, notes: "",
    lines: [{ pIdx: 14, qty: 1 }, { pIdx: 8,  qty: 2 }] },
  { custIdx: 1, method: "upi",          discount: 0,   status: "PAID",    daysAgo: 7, notes: "Anniversary gift",
    lines: [{ pIdx: 3,  qty: 1 }, { pIdx: 7,  qty: 2 }] },
];

// ══════════════════════════════════════════════════════════════
// CLEAR
// ══════════════════════════════════════════════════════════════
async function clearAll() {
  head("Clearing All Data");
  await sequelize.authenticate();
  // Delete in FK-safe order
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await InvoiceItem.destroy({ where: {}, truncate: true });
  await Invoice.destroy({     where: {}, truncate: true });
  await Product.destroy({     where: {}, truncate: true });
  await Customer.destroy({    where: {}, truncate: true });
  await User.destroy({        where: {}, truncate: true });
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  log("All tables cleared successfully");
}

// ══════════════════════════════════════════════════════════════
// SEED
// ══════════════════════════════════════════════════════════════
async function seed() {
  console.log(`\n${C.bold(C.cyan("╔══════════════════════════════════════════════╗"))}`);
  console.log(C.bold(C.cyan(   "║    ShopFlow — MySQL Database Seeder v1.0    ║")));
  console.log(C.bold(C.cyan(   "╚══════════════════════════════════════════════╝\n")));

  await sequelize.authenticate();
  info("Connected to MySQL successfully");
  await sequelize.sync({ alter: false });

  const t = await sequelize.transaction();

  try {
    // ── 1. User ──────────────────────────────────────────────
    head("Step 1 — Creating Demo User");

    const hashedPw = await bcrypt.hash(DEMO_USER.password, 12);
    const [user, userCreated] = await User.findOrCreate({
      where: { email: DEMO_USER.email },
      defaults: { name: DEMO_USER.name, password: hashedPw },
      transaction: t,
    });

    if (userCreated) log(`Created user: ${user.email}`);
    else             warn(`User already exists: ${user.email} — reusing`);

    line();
    info(`Login credentials:`);
    console.log(`     ${C.bold("Email:")}    ${DEMO_USER.email}`);
    console.log(`     ${C.bold("Password:")} ${DEMO_USER.password}`);
    line();

    // ── 2. Products ──────────────────────────────────────────
    head("Step 2 — Creating Products");

    const createdProducts = [];
    for (const p of PRODUCTS) {
      const [product, created] = await Product.findOrCreate({
        where: { ownerId: user.id, sku: p.sku },
        defaults: { ...p, ownerId: user.id },
        transaction: t,
      });
      createdProducts.push(product);
      const status = product.stock <= 10 ? C.yellow("LOW STOCK") : C.green("IN STOCK ");
      if (created) log(`[${p.sku}] ${p.name.padEnd(28)} ₹${String(p.price).padStart(5)}  stock:${String(p.stock).padStart(3)}  ${status}`);
      else         warn(`[${p.sku}] already exists — skipping`);
    }

    // ── 3. Customers ─────────────────────────────────────────
    head("Step 3 — Creating Customers");

    const createdCustomers = [];
    for (const c of CUSTOMERS) {
      const [customer, created] = await Customer.findOrCreate({
        where: { ownerId: user.id, email: c.email },
        defaults: { ...c, ownerId: user.id },
        transaction: t,
      });
      createdCustomers.push(customer);
      const tier = c.tier === "VIP" ? C.cyan("VIP") : c.tier === "Regular" ? C.green("Regular") : C.dim("New");
      if (created) log(`${c.name.padEnd(16)} ${c.email.padEnd(26)} [${tier}]  ${c.orders} orders`);
      else         warn(`${c.email} already exists — skipping`);
    }

    // ── 4. Invoices ──────────────────────────────────────────
    head("Step 4 — Creating Invoices");

    let invCount = await Invoice.count({ where: { ownerId: user.id }, transaction: t });

    for (const tmpl of INVOICE_TEMPLATES) {
      const customer = createdCustomers[tmpl.custIdx];
      if (!customer) { warn("Customer not found — skipping invoice"); continue; }

      // Build line items
      const lines = tmpl.lines.map(({ pIdx, qty }) => {
        const product = createdProducts[pIdx];
        return {
          productId: product.id,
          sku:       product.sku,
          name:      product.name,
          quantity:  qty,
          unitPrice: parseFloat(product.price),
          total:     parseFloat((qty * parseFloat(product.price)).toFixed(2)),
        };
      });

      const subtotalRaw = lines.reduce((s, l) => s + l.total, 0);
      const gst         = calcGST(subtotalRaw, tmpl.discount);
      invCount++;
      const invoiceNumber = `INV-${String(invCount).padStart(4, "0")}`;

      // Set createdAt to daysAgo
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - tmpl.daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 59));

      const invoice = await Invoice.create({
        ownerId:         user.id,
        customerId:      customer.id,
        invoiceNumber,
        customerName:    customer.name,
        customerEmail:   customer.email,
        customerPhone:   customer.phone,
        customerAddress: customer.address || "",
        customerGstin:   customer.gstin   || "",
        subtotal:        gst.subtotal,
        discount:        gst.discount,
        gstRate:         gst.gstRate,
        cgst:            gst.cgst,
        sgst:            gst.sgst,
        gstAmount:       gst.gstAmount,
        total:           gst.total,
        paymentMethod:   tmpl.method,
        status:          tmpl.status,
        notes:           tmpl.notes,
        createdAt,
        updatedAt:       createdAt,
      }, { transaction: t });

      await InvoiceItem.bulkCreate(
        lines.map(l => ({ ...l, invoiceId: invoice.id })),
        { transaction: t }
      );

      const statusLabel = tmpl.status === "PAID"
        ? C.green("PAID   ")
        : C.yellow("PENDING");

      log(
        `${invoiceNumber}  ${customer.name.padEnd(15)}  ` +
        `₹${String(gst.total.toFixed(2)).padStart(10)}  ` +
        `[${statusLabel}]  ${tmpl.method.toUpperCase()}`
      );
    }

    // ── Commit ───────────────────────────────────────────────
    await t.commit();

    // ── Summary ──────────────────────────────────────────────
    const totalInvoices  = await Invoice.count({ where: { ownerId: user.id } });
    const totalProducts  = await Product.count({ where: { ownerId: user.id, isActive: true } });
    const totalCustomers = await Customer.count({ where: { ownerId: user.id, isActive: true } });
    const lowStock       = await Product.count({ where: { ownerId: user.id, isActive: true, stock: { [Op.lte]: 10 } } });
    const pending        = await Invoice.count({ where: { ownerId: user.id, status: "PENDING" } });

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const [todaySalesRow] = await sequelize.query(
      `SELECT COALESCE(SUM(total),0) as sales FROM invoices 
       WHERE ownerId=${user.id} AND status='PAID' AND createdAt >= '${todayStart.toISOString()}'`
    );
    const todaySales = parseFloat(todaySalesRow[0]?.sales || 0).toFixed(2);

    console.log(`
${C.bold(C.cyan("── Seed Complete 🎉 ──"))}

  ${C.bold("Database Summary:")}
  ┌────────────────────────────────────────┐
  │  Products created   : ${String(totalProducts).padStart(3)}               │
  │  Customers created  : ${String(totalCustomers).padStart(3)}               │
  │  Invoices created   : ${String(totalInvoices).padStart(3)}               │
  ├────────────────────────────────────────┤
  │  Low stock items    : ${String(lowStock).padStart(3)}               │
  │  Pending invoices   : ${String(pending).padStart(3)}               │
  │  Today's sales      : ₹${String(todaySales).padStart(12)}        │
  └────────────────────────────────────────┘

  ${C.bold("Login to your app:")}
  ${C.cyan("URL:")}      http://localhost:5173
  ${C.cyan("Email:")}    ${DEMO_USER.email}
  ${C.cyan("Password:")} ${DEMO_USER.password}
`);

  } catch (e) {
    await t.rollback();
    err(`Seed failed — all changes rolled back`);
    throw e;
  }
}

// ══════════════════════════════════════════════════════════════
// ENTRY POINT
// ══════════════════════════════════════════════════════════════
(async () => {
  try {
    const args = process.argv.slice(2);

    if (args.includes("--fresh")) {
      await clearAll();
      await seed();
    } else if (args.includes("--clear")) {
      await clearAll();
      console.log("\n" + C.green("✔  Database cleared. Run `node seed.js` to re-seed.\n"));
    } else {
      await seed();
    }

    await sequelize.close();
    process.exit(0);
  } catch (e) {
    err(e.message);
    console.error(e);
    await sequelize.close();
    process.exit(1);
  }
})();