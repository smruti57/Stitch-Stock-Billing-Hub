const express  = require("express");
const { Op } = require("sequelize");
const Customer = require("../models/Customer");
const { Invoice } = require("../models/Invoice");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, gstin } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ success: false, message: "name, email, phone required." });

    const exists = await Customer.findOne({
      where: { ownerId: req.user.id, email: email.toLowerCase().trim(), isActive: true },
    });
    if (exists)
      return res.status(409).json({ success: false, message: "Email already registered." });

    const customer = await Customer.create({
      ownerId:  req.user.id,
      name,
      email:    email.toLowerCase().trim(),
      phone,
      address:  address || "",
      gstin:    gstin   || "",
    });

    res.status(201).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, tier, skip = 0, limit = 100 } = req.query;

    const where = { ownerId: req.user.id, isActive: true };

    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (tier) where.tier = tier;

    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: Number(skip),
      limit:  Number(limit),
    });

    res.status(200).json({ success: true, total: count, customers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id/transactions", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found." });

    const invoices = await Invoice.findAll({
      where: { ownerId: req.user.id, customerId: req.params.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, total: invoices.length, transactions: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found." });
    res.status(200).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const allowed = ["name", "email", "phone", "address", "gstin", "isActive"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.email) updates.email = updates.email.toLowerCase().trim();

    const customer = await Customer.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found." });

    await customer.update(updates);
    res.status(200).json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found." });

    await customer.update({ isActive: false });
    res.status(200).json({ success: true, message: "Customer deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
