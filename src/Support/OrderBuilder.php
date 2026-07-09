<?php

namespace Zerp\Restaurant\Support;

use Zerp\Restaurant\Models\MenuItem;
use Zerp\Restaurant\Models\Order;

/**
 * Builds an order's line items from a cart payload, resolving every price
 * server-side from the tenant's own menu (client prices are never trusted) and
 * snapshotting names/prices so later menu edits don't rewrite order history.
 */
class OrderBuilder
{
    /**
     * @param array $lines each: menu_item_id, menu_item_variation_id?, modifier_option_ids[]?, quantity, notes?
     */
    public static function syncItems(Order $order, array $lines, int $creatorId): void
    {
        $order->items()->delete();

        // Load only this tenant's menu items with their variations + options.
        $menuItems = MenuItem::where('created_by', $creatorId)
            ->with(['variations', 'modifierGroups.options'])
            ->whereIn('id', array_filter(array_column($lines, 'menu_item_id')))
            ->get()
            ->keyBy('id');

        $subtotal = 0;

        foreach ($lines as $line) {
            $item = $menuItems->get($line['menu_item_id'] ?? null);
            if (!$item) {
                continue; // silently drop unknown/cross-tenant items
            }

            $qty = max(1, (int) ($line['quantity'] ?? 1));

            $variation = null;
            if (!empty($line['menu_item_variation_id'])) {
                $variation = $item->variations->firstWhere('id', (int) $line['menu_item_variation_id']);
            }
            $unitPrice = (float) ($variation ? $variation->price : $item->price);
            $name = $item->name . ($variation ? ' - ' . $variation->name : '');

            // Selected options must belong to this item's own modifier groups.
            $validOptions = $item->modifierGroups->flatMap->options->keyBy('id');
            $selectedIds = array_map('intval', $line['modifier_option_ids'] ?? []);
            $selected = collect($selectedIds)->map(fn ($id) => $validOptions->get($id))->filter();

            $modifiersTotal = (float) $selected->sum('price');
            $lineTotal = ($unitPrice + $modifiersTotal) * $qty;
            $subtotal += $lineTotal;

            $orderItem = $order->items()->create([
                'menu_item_id' => $item->id,
                'menu_item_variation_id' => $variation?->id,
                'name' => $name,
                'unit_price' => $unitPrice,
                'quantity' => $qty,
                'line_total' => $lineTotal,
                'notes' => $line['notes'] ?? null,
            ]);

            foreach ($selected as $option) {
                $orderItem->modifiers()->create([
                    'modifier_option_id' => $option->id,
                    'name' => $option->name,
                    'price' => $option->price,
                ]);
            }
        }

        $discount = (float) $order->discount;
        $order->update([
            'subtotal' => $subtotal,
            'total' => max(0, $subtotal - $discount),
        ]);
    }
}
