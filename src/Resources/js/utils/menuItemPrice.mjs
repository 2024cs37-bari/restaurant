// Resolve a menu item's price for a chosen variation + selected modifier options.
//
//   price = (variation ? variation.price : item.price) + Σ selected option prices
//
// Variation price is absolute (replaces base); modifier option price is a delta.
// Pure module (no imports) so it bundles into the browser build; self-check lives
// in menuItemPrice.selfcheck.mjs.

export function menuItemPrice(item, variationId, modifierOptionIds = []) {
  if (!item) return 0;
  const variation = (item.variations || []).find((v) => String(v.id) === String(variationId));
  let price = variation ? Number(variation.price) || 0 : Number(item.price) || 0;
  const selected = new Set((modifierOptionIds || []).map(String));
  for (const group of item.modifier_groups || []) {
    for (const opt of group.options || []) {
      if (selected.has(String(opt.id))) price += Number(opt.price) || 0;
    }
  }
  return price;
}
