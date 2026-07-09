// Derive a kitchen ticket's overall state from its items' kitchen_status.
//   all pending          -> 'new'
//   some ready, some not -> 'preparing'
//   all ready (>=1 item)  -> 'ready'
//   no unserved items     -> 'done'
// Pure module; self-check in ticketStatus.selfcheck.mjs.

export function ticketStatus(items) {
  const active = (items || []).filter((i) => i && i.kitchen_status !== 'served');
  if (active.length === 0) return 'done';
  const ready = active.filter((i) => i.kitchen_status === 'ready').length;
  if (ready === 0) return 'new';
  if (ready === active.length) return 'ready';
  return 'preparing';
}
