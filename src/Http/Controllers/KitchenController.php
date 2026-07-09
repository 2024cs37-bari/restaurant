<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Models\KitchenStation;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\OrderItem;

class KitchenController extends Controller
{
    // The Kitchen Display System: fired, still-open orders with unserved items.
    public function index()
    {
        if (!Auth::user()->can('manage-kitchen')) {
            return back()->with('error', __('Permission denied'));
        }

        $orders = Order::where('created_by', creatorId())
            ->where('status', 'open')
            ->whereNotNull('fired_at')
            ->with([
                'items' => fn ($q) => $q->where('kitchen_status', '!=', 'served'),
                'items.modifiers',
                'items.menuItem:id,kitchen_station_id',
                'items.menuItem.station:id,name',
                'table:id,name',
            ])
            ->orderBy('fired_at')
            ->get();

        return Inertia::render('Restaurant/Kitchen/Index', [
            'orders' => $orders,
            'stations' => KitchenStation::where('created_by', creatorId())
                ->orderBy('order')->get(['id', 'name']),
        ]);
    }

    public function itemStatus(Request $request, OrderItem $item)
    {
        if (!Auth::user()->can('edit-kitchen') || !$this->ownsItem($item)) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validate(['status' => 'required|in:pending,ready,served']);

        $item->update(['kitchen_status' => $validated['status']]);

        return back()->with('success', __('Kitchen status updated.'));
    }

    public function orderReady(Order $order)
    {
        if (!Auth::user()->can('edit-kitchen') || $order->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        $order->items()->where('kitchen_status', 'pending')->update(['kitchen_status' => 'ready']);

        return back()->with('success', __('All items marked ready.'));
    }

    private function ownsItem(OrderItem $item): bool
    {
        return optional($item->order)->created_by == creatorId();
    }
}
