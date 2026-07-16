// Client-side running totals for the POS cart (display only - the server
// recomputes authoritatively from the tenant's menu on save).
//
// A cart line: { unit_price, quantity, modifiers: [{ price }] }
//   line total = (unit_price + Σ modifier prices) * quantity
// Pure module (no imports); self-check in orderTotals.selfcheck.mjs.

export function lineTotal(line) {
  const unit = Number(line?.unit_price) || 0;
  const mods = (line?.modifiers || []).reduce((s, m) => s + (Number(m?.price) || 0), 0);
  const qty = Math.max(1, Number(line?.quantity) || 1);
  return (unit + mods) * qty;
}

export function orderTotals(lines, discount = 0) {
  const subtotal = (lines || []).reduce((s, l) => s + lineTotal(l), 0);
  const d = Math.min(Number(discount) || 0, subtotal);
  return { subtotal, discount: d, total: subtotal - d };
}
