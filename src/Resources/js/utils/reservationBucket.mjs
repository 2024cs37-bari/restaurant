// Bucket a reservation by its date relative to today: 'today' | 'upcoming' | 'past'.
// Pure module (no imports) so it bundles into the browser build; self-check in
// reservationBucket.selfcheck.mjs.

export function reservationBucket(reservedAt, now = new Date()) {
  if (!reservedAt) return 'upcoming';
  const d = new Date(String(reservedAt).substring(0, 10) + 'T00:00:00');
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  if (d.getTime() === t.getTime()) return 'today';
  return d < t ? 'past' : 'upcoming';
}
