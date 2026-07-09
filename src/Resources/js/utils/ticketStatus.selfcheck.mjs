// Self-check for ticketStatus.mjs. Node-only, never imported by the app.
// Run: `node ticketStatus.selfcheck.mjs` (exits non-zero on failure).
import assert from 'node:assert/strict';
import { ticketStatus } from './ticketStatus.mjs';

assert.equal(ticketStatus([{ kitchen_status: 'pending' }, { kitchen_status: 'pending' }]), 'new');
assert.equal(ticketStatus([{ kitchen_status: 'ready' }, { kitchen_status: 'pending' }]), 'preparing');
assert.equal(ticketStatus([{ kitchen_status: 'ready' }, { kitchen_status: 'ready' }]), 'ready');
// served items are ignored; remaining all ready -> ready
assert.equal(ticketStatus([{ kitchen_status: 'served' }, { kitchen_status: 'ready' }]), 'ready');
// everything served -> done
assert.equal(ticketStatus([{ kitchen_status: 'served' }]), 'done');
assert.equal(ticketStatus([]), 'done');

console.log('ticketStatus self-check passed');
