<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\MenuItem;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\RestaurantTable;
use Zerp\Restaurant\Models\KitchenStation;

class DashboardApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-restaurant-dashboard')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $creatorId = creatorId();

            $totalMenuItems = MenuItem::where('created_by', $creatorId)->count();
            $totalTables = RestaurantTable::where('created_by', $creatorId)->count();
            $totalOrdersToday = Order::where('created_by', $creatorId)->whereDate('created_at', now()->today())->count();
            // Active kitchen tickets: fired, still-open orders that still have an
            // unserved item. Kitchen state is per item (kitchen_status), not the
            // order's own status (open/completed/cancelled).
            $pendingKitchenTickets = Order::where('created_by', $creatorId)
                ->where('status', 'open')
                ->whereNotNull('fired_at')
                ->whereHas('items', fn ($q) => $q->where('kitchen_status', '!=', 'served'))
                ->count();

            $recentOrders = Order::where('created_by', $creatorId)
                ->with(['table', 'items.menuItem'])
                ->latest()
                ->limit(5)
                ->get();

            return $this->successResponse([
                'stats' => [
                    'total_menu_items' => $totalMenuItems,
                    'total_tables' => $totalTables,
                    'total_orders_today' => $totalOrdersToday,
                    'pending_kitchen_tickets' => $pendingKitchenTickets,
                ],
                'recent_orders' => $recentOrders,
            ], __('Dashboard retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Restaurant Dashboard API error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
