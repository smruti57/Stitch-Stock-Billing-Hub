const PDFDocument = require("pdfkit");

// ── Brand colours ───────────────────────────────────────────────
const NAVY  = "#1a2332";
const BRASS = "#b1944c";
const GREY  = "#64748b";
const LIGHT = "#f8f9fa";
const WHITE = "#ffffff";
const BLACK = "#121927";

/**
 * generateInvoicePDF
 *
 * Streams a PDFKit document to the provided Express `res` object.
 *
 * @param {object} invoice   - Fully populated invoice object from MongoDB
 * @param {object} res       - Express response stream
 */
const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Invoice ${invoice.invoiceNumber}`,
      Author: "ShopFlow",
    },
  });

  // ── Pipe to response ──────────────────────────────────────────
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoice.invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  const pageWidth  = doc.page.width  - 100; // left+right margin
  const col = {
    num:   50,
    name:  80,
    qty:   320,
    price: 380,
    total: 460,
  };

  // ══════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════
  doc.rect(50, 40, pageWidth, 80).fill(NAVY);

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(26)
    .text("ShopFlow", 65, 55);

  doc
    .fillColor(BRASS)
    .font("Helvetica")
    .fontSize(9)
    .text("STOCK & BILLING HUB", 65, 84);

  // Invoice meta (right side)
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("INVOICE", 0, 55, { align: "right" });

  doc
    .fillColor("#cbd5e1")
    .font("Helvetica")
    .fontSize(9)
    .text(`# ${invoice.invoiceNumber}`, 0, 78, { align: "right" })
    .text(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      0,
      90,
      { align: "right" }
    )
    .text(`Status: ${invoice.status}`, 0, 102, { align: "right" });

  // ══════════════════════════════════════════════════════════════
  // BILL TO + PAYMENT INFO
  // ══════════════════════════════════════════════════════════════
  const sectionY = 140;
  doc.rect(50, sectionY, pageWidth, 90).fill(LIGHT);

  const cust = invoice.customer || {};

  doc
    .fillColor(GREY)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("BILL TO", 65, sectionY + 12);

  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(cust.name || "—", 65, sectionY + 25);

  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(cust.phone  || "—", 65, sectionY + 40)
    .text(cust.address || "—", 65, sectionY + 52);

  if (cust.gstin) {
    doc.text(`GSTIN: ${cust.gstin}`, 65, sectionY + 64);
  }

  // Payment info (right)
  doc
    .fillColor(GREY)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("PAYMENT", 0, sectionY + 12, { align: "right" });

  doc
    .fillColor(BLACK)
    .font("Helvetica")
    .fontSize(9)
    .text(`Method: ${(invoice.paymentMethod || "cash").toUpperCase()}`, 0, sectionY + 25, { align: "right" })
    .text(`GST Rate: ${(invoice.gstRate * 100).toFixed(0)}%`, 0, sectionY + 38, { align: "right" })
    .text(
      `CGST ${(invoice.gstRate * 100 / 2).toFixed(0)}% + SGST ${(invoice.gstRate * 100 / 2).toFixed(0)}%`,
      0,
      sectionY + 51,
      { align: "right" }
    );

  // ══════════════════════════════════════════════════════════════
  // LINE ITEMS TABLE
  // ══════════════════════════════════════════════════════════════
  const tableTop = sectionY + 108;

  // Table header background
  doc.rect(50, tableTop, pageWidth, 24).fill(NAVY);

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(9);

  doc.text("#",           col.num,   tableTop + 8);
  doc.text("Description", col.name,  tableTop + 8);
  doc.text("Qty",         col.qty,   tableTop + 8);
  doc.text("Unit Price",  col.price, tableTop + 8);
  doc.text("Total",       col.total, tableTop + 8);

  // Rows
  const items = invoice.items || [];
  let rowY = tableTop + 24;

  items.forEach((item, i) => {
    const bg = i % 2 === 0 ? WHITE : LIGHT;
    doc.rect(50, rowY, pageWidth, 28).fill(bg);

    doc
      .fillColor(BLACK)
      .font("Helvetica")
      .fontSize(9);

    doc.text(String(i + 1),                        col.num,   rowY + 9);
    doc.text(item.name || "—",                     col.name,  rowY + 9, { width: 220, ellipsis: true });
    doc.text(String(item.quantity),                col.qty,   rowY + 9);
    doc.text(`₹${fmtNum(item.unitPrice)}`,         col.price, rowY + 9);
    doc.text(`₹${fmtNum(item.total)}`,             col.total, rowY + 9);

    if (item.sku) {
      doc
        .fillColor(GREY)
        .fontSize(7.5)
        .text(item.sku, col.name, rowY + 19);
    }

    rowY += 28;
  });

  // ══════════════════════════════════════════════════════════════
  // GST SUMMARY
  // ══════════════════════════════════════════════════════════════
  const summaryX     = col.price;
  const summaryWidth = 50 + pageWidth - summaryX;
  let   sumY         = rowY + 16;

  const addSummaryRow = (label, value, bold = false, highlight = false) => {
    if (highlight) {
      doc.rect(summaryX - 10, sumY - 4, summaryWidth + 10, 24).fill(NAVY);
    }
    doc
      .fillColor(highlight ? WHITE : bold ? BLACK : GREY)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 11 : 9)
      .text(label, summaryX - 60, sumY, { width: 120, align: "right" })
      .text(value,  summaryX + 10, sumY, { width: summaryWidth - 10, align: "right" });
    sumY += bold ? 28 : 20;
  };

  addSummaryRow("Subtotal",           `₹${fmtNum(invoice.subtotal)}`);
  if (invoice.discount > 0) {
    addSummaryRow("Discount",         `-₹${fmtNum(invoice.discount)}`);
  }
  addSummaryRow("Taxable Amount",     `₹${fmtNum(invoice.subtotal - invoice.discount)}`);
  addSummaryRow(
    `CGST (${(invoice.gstRate * 100 / 2).toFixed(0)}%)`,
    `₹${fmtNum(invoice.cgst)}`
  );
  addSummaryRow(
    `SGST (${(invoice.gstRate * 100 / 2).toFixed(0)}%)`,
    `₹${fmtNum(invoice.sgst)}`
  );

  doc
    .moveTo(summaryX - 60, sumY - 4)
    .lineTo(50 + pageWidth, sumY - 4)
    .strokeColor(BRASS)
    .lineWidth(1.5)
    .stroke();

  addSummaryRow("GRAND TOTAL", `₹${fmtNum(invoice.total)}`, true, true);

  // ══════════════════════════════════════════════════════════════
  // NOTES
  // ══════════════════════════════════════════════════════════════
  if (invoice.notes) {
    sumY += 16;
    doc
      .fillColor(GREY)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Notes", 50, sumY);
    doc
      .fillColor(BLACK)
      .font("Helvetica")
      .fontSize(9)
      .text(invoice.notes, 50, sumY + 14, { width: pageWidth });
  }

  // ══════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════
  const footerY = doc.page.height - 60;
  doc
    .moveTo(50, footerY)
    .lineTo(50 + pageWidth, footerY)
    .strokeColor(BRASS)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Thank you for your business!  ·  ShopFlow — Stock & Billing Hub  ·  Generated automatically",
      50,
      footerY + 8,
      { align: "center", width: pageWidth }
    );

  doc.end();
};

// ── Helper: format number with 2 decimal places ────────────────
const fmtNum = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

module.exports = { generateInvoicePDF };
