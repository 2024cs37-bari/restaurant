// Self-check for recipeUsage.mjs. Node-only, never imported by the app.
// Run: `node recipeUsage.selfcheck.mjs` (exits non-zero on failure).
import assert from 'node:assert/strict';
import { recipeUsage } from './recipeUsage.mjs';

const lines = [{ product_id: 5, quantity: 0.2 }, { product_id: 8, quantity: 1 }];
// 3 burgers: 0.2*3=0.6 and 1*3=3
assert.deepEqual(recipeUsage(lines, 3), [
  { product_id: 5, quantity: 0.6 },
  { product_id: 8, quantity: 3 },
]);
// qty 1 default
assert.deepEqual(recipeUsage([{ product_id: 1, quantity: 2 }]), [{ product_id: 1, quantity: 2 }]);
// empty recipe
assert.deepEqual(recipeUsage([], 5), []);

console.log('recipeUsage self-check passed');
