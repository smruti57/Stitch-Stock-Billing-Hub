const express = require("express");
const { Op } = require("sequelize");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { name, sku, category, price, stock, description } = req.body;
    if (!name || !category || price === undefined)
      return res.status(400).json({ success: false, message: "name, category, price required." });

    if (sku) {
      const exists = await Product.findOne({
        where: { ownerId: req.user.id, sku: sku.toUpperCase(), isActive: true },
      });
      if (exists)
        return res.status(409).json({ success: false, message: `SKU '${sku}' already exists.` });
    }

    const product = await Product.create({
      ownerId:     req.user.id,
      name,
      sku:         sku ? sku.toUpperCase() : "",
      category,
      price,
      stock:       stock ?? 0,
      description: description || "",
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET low-stock (routes before :id param)
router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { ownerId: req.user.id, isActive: true, stock: { [Op.lte]: 10 } },
      order: [["stock", "ASC"]],
    });

    res.status(200).json({ success: true, total: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, category, lowStock, skip = 0, limit = 100 } = req.query;

    const where = { ownerId: req.user.id, isActive: true };

    if (search) {
      where[Op.or] = [
        { name:     { [Op.like]: `%${search}%` } },
        { sku:      { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category = category;
    if (lowStock === "true") where.stock = { [Op.lte]: 10 };

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: Number(skip),
      limit:  Number(limit),
    });

    res.status(200).json({ success: true, total: count, products: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const allowed = ["name", "sku", "category", "price", "stock", "description", "isActive"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.sku) updates.sku = updates.sku.toUpperCase();

    const product = await Product.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });

    await product.update(updates);
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });

    await product.update({ isActive: false });
    res.status(200).json({ success: true, message: "Product deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
