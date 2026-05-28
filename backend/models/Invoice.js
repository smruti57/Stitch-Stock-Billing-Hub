const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Invoice = sequelize.define("Invoice", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "customers", key: "id" },
  },
  invoiceNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  customerName:    { type: DataTypes.STRING(200), defaultValue: "" },
  customerEmail:   { type: DataTypes.STRING(200), defaultValue: "" },
  customerPhone:   { type: DataTypes.STRING(20),  defaultValue: "" },
  customerAddress: { type: DataTypes.TEXT,         defaultValue: "" },
  customerGstin:   { type: DataTypes.STRING(20),   defaultValue: "" },

  subtotal:      { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  discount:      { type: DataTypes.DECIMAL(12, 2), defaultValue: 0  },
  gstRate:       { type: DataTypes.DECIMAL(5, 4),  defaultValue: 0.18 },
  cgst:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sgst:          { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  gstAmount:     { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total:         { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "card", "upi", "bank_transfer"),
    defaultValue: "cash",
  },
  status: {
    type: DataTypes.ENUM("PAID", "PENDING", "VOID"),
    defaultValue: "PAID",
  },
  notes: { type: DataTypes.TEXT, defaultValue: "" },
}, {
  tableName: "invoices",
  timestamps: true,
});

const InvoiceItem = sequelize.define("InvoiceItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "invoices", key: "id" },
    onDelete: "CASCADE",
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: "products", key: "id" },
  },
  sku:       { type: DataTypes.STRING(50),    defaultValue: "" },
  name:      { type: DataTypes.STRING(200),   allowNull: false },
  quantity:  { type: DataTypes.INTEGER,       allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  total:     { type: DataTypes.DECIMAL(12,2), allowNull: false },
}, {
  tableName: "invoice_items",
  timestamps: false,
});

Invoice.hasMany(InvoiceItem,  { foreignKey: "invoiceId", as: "items" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

module.exports = { Invoice, InvoiceItem };
