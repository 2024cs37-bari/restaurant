// Compute ingredient consumption for a sold menu item.
//   used(product) = recipeLine.quantity * orderItemQuantity
// Pure module; self-check in recipeUsage.selfcheck.mjs. The authoritative
// deduction happens server-side (StockDeductor); this mirrors the math for
// display (e.g. a recipe-cost/usage preview).

export function recipeUsage(lines, itemQty = 1) {
  const qty = Math.max(0, Number(itemQty) || 0);
  return (lines || []).map((l) => ({
    product_id: l.product_id,
    // round to 3 dp to match the stored decimal(10,3) precision (avoids float noise)
    quantity: Math.round((Number(l.quantity) || 0) * qty * 1000) / 1000,
  }));
}
