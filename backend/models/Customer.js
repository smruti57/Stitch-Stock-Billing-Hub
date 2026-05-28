const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
    onDelete: "CASCADE",
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  gstin: {
    type: DataTypes.STRING(20),
    defaultValue: "",
  },
  tier: {
    type: DataTypes.ENUM("New", "Regular", "VIP"),
    defaultValue: "New",
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalSpent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "customers",
  timestamps: true,
});

module.exports = Customer;
