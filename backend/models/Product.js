const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define("Product", {
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
  sku: {
    type: DataTypes.STRING(50),
    defaultValue: "",
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "products",
  timestamps: true,
});

Product.prototype.getStatus = function () {
  return this.stock <= 10 ? "LOW STOCK" : "IN STOCK";
};

module.exports = Product;
