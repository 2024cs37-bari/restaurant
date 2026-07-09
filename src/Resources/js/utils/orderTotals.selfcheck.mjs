// Self-check for orderTotals.mjs. Node-only, never imported by the app.
// Run: `node orderTotals.selfcheck.mjs` (exits non-zero on failure).
import assert from 'node:assert/strict';
import { lineTotal, orderTotals } from './orderTotals.mjs';

// (500 + 50 + 20) * 2 = 1140
assert.equal(lineTotal({ unit_price: 500, quantity: 2, modifiers: [{ price: 50 }, { price: 20 }] }), 1140);
// no modifiers, qty defaults to 1
assert.equal(lineTotal({ unit_price: 300 }), 300);
// qty floored to 1
assert.equal(lineTotal({ unit_price: 100, quantity: 0 }), 100);

const lines = [
  { unit_price: 500, quantity: 2, modifiers: [{ price: 50 }] }, // 1100
  { unit_price: 250, quantity: 1, modifiers: [] },              // 250
];
assert.deepEqual(orderTotals(lines), { subtotal: 1350, discount: 0, total: 1350 });
// discount applied
assert.deepEqual(orderTotals(lines, 100), { subtotal: 1350, discount: 100, total: 1250 });
// discount can't exceed subtotal
assert.deepEqual(orderTotals(lines, 5000), { subtotal: 1350, discount: 1350, total: 0 });
// empty cart
assert.deepEqual(orderTotals([]), { subtotal: 0, discount: 0, total: 0 });

console.log('orderTotals self-check passed');
