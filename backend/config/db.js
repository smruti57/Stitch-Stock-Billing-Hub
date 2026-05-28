const path = require("path");
const { Sequelize } = require("sequelize");
const { ensureSchema } = require("../migrations/manualMigrations");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "../database.sqlite"),
  logging: false,
  pool: {
    max:     10,
    min:     0,
    acquire: 30000,
    idle:    10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅  Database connected successfully");

    try {
      await ensureSchema(sequelize);
      await sequelize.sync();
      console.log("✅  All tables synced");
    } catch (syncErr) {
      console.error("⚠  Failed to ensure DB schema:", syncErr.message || syncErr);
      if (process.env.ALLOW_FORCE_SYNC === "true") {
        console.warn("⚠  ALLOW_FORCE_SYNC=true detected — recreating tables (destructive) in development...");
        await sequelize.sync({ force: true });
        console.log("✅  Tables recreated successfully");
      } else {
        console.error(
          "❌  Schema ensure failed and ALLOW_FORCE_SYNC is not set. To recreate tables (destructive), set ALLOW_FORCE_SYNC=true."
        );
        throw syncErr;
      }
    }
  } catch (err) {
    console.error("❌  Database connection error:", err.message);
    process.exit(1);
  }
};

const associateModels = () => {
  const User     = require("../models/User");
  const Product  = require("../models/Product");
  const Customer = require("../models/Customer");
  const { Invoice, InvoiceItem } = require("../models/Invoice");

  User.hasMany(Product,  { foreignKey: "ownerId", as: "products" });
  User.hasMany(Customer, { foreignKey: "ownerId", as: "customers" });
  User.hasMany(Invoice,  { foreignKey: "ownerId", as: "invoices" });

  Product.belongsTo(User, { foreignKey: "ownerId" });

  Customer.belongsTo(User,    { foreignKey: "ownerId" });
  Customer.hasMany(Invoice,   { foreignKey: "customerId", as: "invoices" });

  Invoice.belongsTo(User,     { foreignKey: "ownerId" });
  Invoice.belongsTo(Customer, { foreignKey: "customerId" });
};

module.exports = { sequelize, connectDB, associateModels };
