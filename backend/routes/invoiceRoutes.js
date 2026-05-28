const express  = require("express");
const { Op, fn, col, literal } = require("sequelize");
const { Invoice, InvoiceItem } = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product  = require("../models/Product");
const { sequelize } = require("../config/db");
const { protect }            = require("../middleware/authMiddleware");
const { calculateGST }       = require("../utils/gst");
const { generateInvoicePDF } = require("../utils/generateInvoice");

const router = express.Router();

router.use(protect);

const nextInvoiceNumber = async (ownerId) => {
  const count = await Invoice.count({ where: { ownerId } });
  return `INV-${String(count + 1).padStart(4, "0")}`;
};

router.get("/stats/dashboard", async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [totalSKUs, lowStockCount, pendingBills, pendingAmount] = await Promise.all([
      Product.count({ where: { ownerId, isActive: true } }),
      Product.count({ where: { ownerId, isActive: true, stock: { [Op.lte]: 10 } } }),
      Invoice.count({ where: { ownerId, status: "PENDING" } }),
      Invoice.sum("total", { where: { ownerId, status: "PENDING" } }),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaySales = await Invoice.sum("total", {
      where: { ownerId, status: "PAID", createdAt: { [Op.gte]: startOfDay } },
    });

    res.status(200).json({
      success: true,
      totalSKUs,
      lowStockCount,
      todaySales: parseFloat((todaySales || 0).toFixed(2)),
      pendingBills,
      pendingAmount: parseFloat((pendingAmount || 0).toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, items, paymentMethod, discount, notes } = req.body;

    if (!customerId || !items || items.length === 0)
      return res.status(400).json({ success: false, message: "customerId and items required." });

    const customer = await Customer.findOne({
      where: { id: customerId, ownerId: req.user.id },
      transaction: t,
    });
    if (!customer) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const status = String(req.body.status || "PAID").toUpperCase();
    const allowedStatuses = ["PAID", "PENDING"];
    if (!allowedStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(", ")}` });
    }

    let subtotal = 0;
    const lineItems = items.map((item) => {
      const total = parseFloat(((item.quantity || 1) * (item.price || item.unitPrice || 0)).toFixed(2));
      subtotal += total;
      return {
        productId: item.productId || null,
        sku:       item.sku || "",
        name:      item.name,
        quantity:  item.quantity || 1,
        unitPrice: item.price || item.unitPrice || 0,
        total,
      };
    });

    const productQtyMap = {};
    for (const item of lineItems) {
      if (!item.productId) continue;
      const id = Number(item.productId);
      productQtyMap[id] = (productQtyMap[id] || 0) + item.quantity;
    }

    const productIds = Object.keys(productQtyMap).map(Number);
    const orderedProducts = productIds.length
      ? await Product.findAll({ where: { id: productIds, ownerId: req.user.id }, transaction: t })
      : [];

    if (productIds.length && orderedProducts.length !== productIds.length) {
      const missingIds = productIds.filter((id) => !orderedProducts.some((p) => p.id === id));
      await t.rollback();
      return res.status(400).json({ success: false, message: `Product(s) not found: ${missingIds.join(", ")}` });
    }

    if (status === "PAID") {
      for (const product of orderedProducts) {
        const needed = productQtyMap[product.id] || 0;
        if (needed > product.stock) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${needed}.`,
          });
        }
      }
    }

    const gst = calculateGST(subtotal, discount || 0);
    const invoiceNumber = await nextInvoiceNumber(req.user.id);

    const invoice = await Invoice.create({
      ownerId:         req.user.id,
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
      paymentMethod:   paymentMethod || "cash",
      status,
      notes:           notes || "",
    }, { transaction: t });

    await InvoiceItem.bulkCreate(
      lineItems.map(item => ({ ...item, invoiceId: invoice.id })),
      { transaction: t }
    );

    if (status === "PAID") {
      await Promise.all(orderedProducts.map((product) => {
        const qty = productQtyMap[product.id] || 0;
        if (!qty) return Promise.resolve();
        return product.update({ stock: product.stock - qty }, { transaction: t });
      }));

      const newOrders = customer.totalOrders + 1;
      const newSpent  = parseFloat((customer.totalSpent + gst.total).toFixed(2));
      const newTier   = newOrders >= 10 ? "VIP" : newOrders >= 5 ? "Regular" : "New";

      await customer.update({
        totalOrders: newOrders,
        totalSpent:  newSpent,
        tier:        newTier,
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, customerId, skip = 0, limit = 50 } = req.query;
    const where = { ownerId: req.user.id };
    if (status) where.status = status.toUpperCase();
    if (customerId) where.customerId = Number(customerId);

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: Number(skip),
      limit:  Number(limit),
    });

    res.status(200).json({ success: true, total: count, invoices: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
      include: [{ model: InvoiceItem, as: "items" }],
    });
    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found." });
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status, notes } = req.body;
    const allowed = ["PAID", "PENDING", "VOID"];
    if (status && !allowed.includes(status.toUpperCase())) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Status must be: ${allowed.join(", ")}` });
    }

    const updates = {};
    if (status) updates.status = status.toUpperCase();
    if (notes !== undefined) updates.notes = notes;

    const invoice = await Invoice.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    const previousStatus = invoice.status;
    const newStatus = updates.status || previousStatus;

    if (previousStatus === "PENDING" && newStatus === "PAID") {
      const invoiceItems = await InvoiceItem.findAll({ where: { invoiceId: invoice.id }, transaction: t });
      const productQtyMap = {};
      invoiceItems.forEach((item) => {
        if (!item.productId) return;
        productQtyMap[item.productId] = (productQtyMap[item.productId] || 0) + item.quantity;
      });

      const productIds = Object.keys(productQtyMap).map(Number);
      const orderedProducts = productIds.length
        ? await Product.findAll({ where: { id: productIds, ownerId: req.user.id }, transaction: t })
        : [];

      for (const product of orderedProducts) {
        const needed = productQtyMap[product.id] || 0;
        if (needed > product.stock) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${needed}.`,
          });
        }
      }

      await Promise.all(orderedProducts.map((product) => {
        const qty = productQtyMap[product.id] || 0;
        if (!qty) return Promise.resolve();
        return product.update({ stock: product.stock - qty }, { transaction: t });
      }));

      const customer = await Customer.findOne({ where: { id: invoice.customerId, ownerId: req.user.id }, transaction: t });
      if (!customer) {
        await t.rollback();
        return res.status(404).json({ success: false, message: "Customer not found." });
      }

      const gst = {
        total: parseFloat(invoice.total),
      };
      const newOrders = customer.totalOrders + 1;
      const newSpent  = parseFloat((customer.totalSpent + gst.total).toFixed(2));
      const newTier   = newOrders >= 10 ? "VIP" : newOrders >= 5 ? "Regular" : "New";

      await customer.update({
        totalOrders: newOrders,
        totalSpent:  newSpent,
        tier:        newTier,
      }, { transaction: t });
    }

    await invoice.update(updates, { transaction: t });
    await t.commit();
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/void", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found." });

    await invoice.update({ status: "VOID" });
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, ownerId: req.user.id },
      include: [{ model: InvoiceItem, as: "items" }],
    });
    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found." });

    generateInvoicePDF(invoice.toJSON(), res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
