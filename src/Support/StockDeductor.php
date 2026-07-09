<?php

namespace Zerp\Restaurant\Support;

use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\Recipe;

/**
 * Deducts ingredient stock for a settled order: for each sold menu item, each of
 * its recipe lines consumes (recipe.quantity × item.quantity) from the
 * product-service WarehouseStock. Best-effort — never blocks a sale:
 *  - no-op if the product-service module isn't installed,
 *  - skips ingredients with no stock row,
 *  - allows stock to go negative (over-consumption is surfaced, not prevented).
 */
class StockDeductor
{
    public static function deductForOrder(Order $order): void
    {
        if (!class_exists(\Zerp\ProductService\Models\WarehouseStock::class)) {
            return;
        }

        try {
            $order->loadMissing('items');
            foreach ($order->items as $orderItem) {
                if (!$orderItem->menu_item_id) {
                    continue;
                }
                $lines = Recipe::where('menu_item_id', $orderItem->menu_item_id)
                    ->where('created_by', creatorId())->get();

                foreach ($lines as $line) {
                    $needed = (float) $line->quantity * (int) $orderItem->quantity;
                    if ($needed <= 0) {
                        continue;
                    }
                    // Deduct from the item's first warehouse stock row.
                    $stock = \Zerp\ProductService\Models\WarehouseStock::where('product_id', $line->product_id)
                        ->orderBy('warehouse_id')->first();
                    if ($stock) {
                        $stock->decrement('quantity', $needed);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Restaurant stock deduction failed for order ' . $order->order_number . ': ' . $e->getMessage());
        }
    }
}
