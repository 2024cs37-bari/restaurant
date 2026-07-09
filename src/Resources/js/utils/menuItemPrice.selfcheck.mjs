// Self-check for menuItemPrice.mjs. Node-only, never imported by the app.
// Run: `node menuItemPrice.selfcheck.mjs` (exits non-zero on failure).
import assert from 'node:assert/strict';
import { menuItemPrice } from './menuItemPrice.mjs';

const item = {
  price: 500,
  variations: [{ id: 1, price: 450 }, { id: 2, price: 700 }],
  modifier_groups: [
    { options: [{ id: 10, price: 50 }, { id: 11, price: 0 }] },
    { options: [{ id: 20, price: 120 }] },
  ],
};

// base price, no variation, no modifiers
assert.equal(menuItemPrice(item, null, []), 500);
// variation overrides base
assert.equal(menuItemPrice(item, 2, []), 700);
// variation + two modifiers
assert.equal(menuItemPrice(item, 1, [10, 20]), 450 + 50 + 120);
// unknown variation id falls back to base
assert.equal(menuItemPrice(item, 999, []), 500);
// unknown option id contributes 0
assert.equal(menuItemPrice(item, null, [999]), 500);
// string ids (from JSON / form values) still match
assert.equal(menuItemPrice(item, '2', ['20']), 700 + 120);
// item without variations/modifiers
assert.equal(menuItemPrice({ price: 300 }, null, []), 300);
// null item
assert.equal(menuItemPrice(null, null, []), 0);

console.log('menuItemPrice self-check passed');
