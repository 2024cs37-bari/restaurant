// Self-check for reservationBucket.mjs. Node-only, never imported by the app.
// Run: `node reservationBucket.selfcheck.mjs` (exits non-zero on failure).
import assert from 'node:assert/strict';
import { reservationBucket } from './reservationBucket.mjs';

const now = new Date('2026-07-09T15:00:00');

assert.equal(reservationBucket('2026-07-09T19:30:00', now), 'today');
assert.equal(reservationBucket('2026-07-10T12:00:00', now), 'upcoming');
assert.equal(reservationBucket('2026-07-01T12:00:00', now), 'past');
// same calendar day earlier than "now" is still today (date-based, not time-based)
assert.equal(reservationBucket('2026-07-09T09:00:00', now), 'today');
// null → upcoming (defensive)
assert.equal(reservationBucket(null, now), 'upcoming');

console.log('reservationBucket self-check passed');
