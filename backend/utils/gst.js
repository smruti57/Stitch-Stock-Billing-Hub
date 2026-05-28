/**
 * calculateGST
 *
 * Returns a full GST breakdown for India.
 * Intra-state default: CGST 9% + SGST 9% = 18%
 *
 * @param {number} subtotal   - Pre-tax amount
 * @param {number} discount   - Discount amount (default 0)
 * @param {number} gstRate    - GST rate as decimal (default 0.18)
 * @returns {object}
 */
const calculateGST = (subtotal, discount = 0, gstRate = null) => {
  const rate = gstRate ?? parseFloat(process.env.GST_RATE ?? "0.18");

  const taxableAmount = Math.max(0, subtotal - discount);
  const gstAmount     = parseFloat((taxableAmount * rate).toFixed(2));
  const halfGST       = parseFloat((gstAmount / 2).toFixed(2));
  const total         = parseFloat((taxableAmount + gstAmount).toFixed(2));

  return {
    subtotal:      parseFloat(subtotal.toFixed(2)),
    discount:      parseFloat(discount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    gstRate:       rate,
    cgst:          halfGST,
    sgst:          halfGST,
    igst:          0,               // 0 for intra-state
    gstAmount,
    total,
  };
};

module.exports = { calculateGST };
