<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Http\Requests\SettleOrderRequest;
use Zerp\Restaurant\Http\Requests\StoreOrderRequest;
use Zerp\Restaurant\Http\Requests\UpdateOrderRequest;
use Zerp\Restaurant\Models\MenuCategory;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\RestaurantTable;
use Zerp\Restaurant\Support\OrderBuilder;

class OrderController extends Controller
{
    private function owns(Order $order): bool
    {
        return $order->created_by == creatorId();
    }

    // The POS order-taking screen: menu + tables + open orders.
    public function pos()
    {
        if (!Auth::user()->can('create-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        return Inertia::render('Restaurant/Pos/Index', [
            'categories' => MenuCategory::where('created_by', creatorId())
                ->where('is_active', true)
                ->with([
                    'items' => fn ($q) => $q->where('is_available', true)->orderBy('order'),
                    'items.variations',
                    'items.modifierGroups.options',
                ])->orderBy('order')->get(),
            'tables' => RestaurantTable::where('created_by', creatorId())
                ->orderBy('name')->get(['id', 'name', 'seats', 'status']),
            'openOrders' => Order::where('created_by', creatorId())->where('status', 'open')
                ->with('table:id,name')->latest()->get(),
        ]);
    }

    public function index()
    {
        if (!Auth::user()->can('manage-orders')) {
            return back()->with('error', __('Permission denied'));
        }

        // Bank accounts come from the account module (a restaurant-preset dependency);
        // guard in case it isn't installed so the page still renders.
        $bankAccounts = [];
        if (class_exists(\Zerp\Account\Models\BankAccount::class)) {
            $bankAccounts = \Zerp\Account\Models\BankAccount::where('created_by', creatorId())->get(['id', 'account_name', 'bank_name']);
        }

        return Inertia::render('Restaurant/Orders/Index', [
            'orders' => Order::where('created_by', creatorId())
                ->with(['table:id,name', 'items.modifiers'])
                ->latest()->get(),
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        if (!Auth::user()->can('create-orders')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $order = Order::create([
            'order_number' => Order::nextNumber(creatorId()),
            'type' => $validated['type'],
            'restaurant_table_id' => $validated['type'] === 'dine_in' ? ($validated['restaurant_table_id'] ?? null) : null,
            'customer_name' => $validated['customer_name'] ?? null,
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'status' => 'open',
            'fired_at' => now(), // auto-fire to the kitchen on placement
            'discount' => $validated['discount'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        OrderBuilder::syncItems($order, $validated['lines'], creatorId());
        $this->occupyTable($order);

        return redirect()->route('restaurant.orders.index')->with('success', __('Order :n placed.', ['n' => $order->order_number]));
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        if (!Auth::user()->can('edit-orders') || !$this->owns($order) || $order->status !== 'open') {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $order->update([
            'restaurant_table_id' => $validated['type'] === 'dine_in' ? ($validated['restaurant_table_id'] ?? null) : null,
            'customer_name' => $validated['customer_name'] ?? null,
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'discount' => $validated['discount'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'fired_at' => now(), // re-fire on edit
        ]);

        OrderBuilder::syncItems($order, $validated['lines'], creatorId());
        $this->occupyTable($order);

        return back()->with('success', __('Order updated.'));
    }

    public function settle(SettleOrderRequest $request, Order $order)
    {
        if (!Auth::user()->can('edit-orders') || !$this->owns($order)) {
            return back()->with('error', __('Permission denied'));
        }
        if ($order->status !== 'open') {
            return back()->with('error', __('This order is already closed.'));
        }
        $validated = $request->validated();

        if (isset($validated['discount'])) {
            $order->discount = $validated['discount'];
            $order->total = max(0, (float) $order->subtotal - (float) $validated['discount']);
        }
        $order->payment_method = $validated['payment_method'];
        $order->bank_account_id = $validated['bank_account_id'] ?? null;
        $order->paid_at = now();
        $order->status = 'completed';
        $order->save();

        // Free the table when a dine-in order is settled.
        if ($order->restaurant_table_id) {
            RestaurantTable::where('id', $order->restaurant_table_id)
                ->where('created_by', creatorId())
                ->update(['status' => 'free']);
        }

        // Post the sale as revenue into accounting (best-effort, never blocks settlement).
        $posting = \Zerp\Restaurant\Support\RevenuePoster::post($order);

        $message = __('Order :n settled.', ['n' => $order->order_number]);
        if ($posting['posted']) {
            return back()->with('success', $message . ' ' . __('Revenue posted to accounting.'));
        }
        // Only nag about posting when the user actually chose a deposit account.
        if ($order->bank_account_id) {
            return back()->with('warning', $message . ' ' . __('Revenue was not posted:') . ' ' . ($posting['reason'] ?? ''));
        }

        return back()->with('success', $message);
    }

    public function cancel(Order $order)
    {
        if (!Auth::user()->can('edit-orders') || !$this->owns($order)) {
            return back()->with('error', __('Permission denied'));
        }
        if ($order->status !== 'open') {
            return back()->with('error', __('This order is already closed.'));
        }

        $order->update(['status' => 'cancelled']);
        if ($order->restaurant_table_id) {
            RestaurantTable::where('id', $order->restaurant_table_id)
                ->where('created_by', creatorId())
                ->update(['status' => 'free']);
        }

        return back()->with('success', __('Order cancelled.'));
    }

    // A dine-in order occupies its table.
    private function occupyTable(Order $order): void
    {
        if ($order->restaurant_table_id) {
            RestaurantTable::where('id', $order->restaurant_table_id)
                ->where('created_by', creatorId())
                ->update(['status' => 'seated']);
        }
    }
}
