require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const { connectDB, associateModels } = require("./config/db");
const authRoutes   = require("./routes/authRoutes");
const productRoutes  = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes  = require("./routes/invoiceRoutes");
const User           = require("./models/User");

const ensureDefaultUser = async () => {
  const count = await User.count();
  if (count === 0) {
    await User.create({
      name: "Demo User",
      email: "demo@shopflow.in",
      password: "Demo@1234",
    });
    console.log("✅  Default demo user created: demo@shopflow.in / Demo@1234");
  }
};

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",   // Vite dev server
    "http://localhost:3000",   // CRA dev server
    "*",                       // tighten in production
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (development) ───────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method}  ${req.originalUrl}`);
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices",  invoiceRoutes);

// ── Health check ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    app:     "ShopFlow API",
    version: "1.0.0",
    status:  "ok",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status:   "ok",
    database: "connected",
    uptime:   process.uptime().toFixed(1) + "s",
  });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  associateModels();
  await ensureDefaultUser();

  app.listen(PORT, () => {
    console.log(`🚀  ShopFlow API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
};

startServer();
