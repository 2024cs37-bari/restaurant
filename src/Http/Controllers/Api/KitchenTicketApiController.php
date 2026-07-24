<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\KitchenStation;

class KitchenTicketApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-kitchen-tickets')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $orders = Order::query()
                ->with(['table', 'items.menuItem', 'items.variation'])
                ->where('created_by', creatorId())
                ->whereIn('kitchen_status', ['pending', 'in_prep', 'ready'])
                ->when($request->station_id, function($q) use ($request) {
                    $q->whereHas('items.menuItem', fn($query) => $query->where('kitchen_station_id', $request->station_id));
                })
                ->latest()
                ->paginate($request->get('per_page', 10))
                ->withQueryString();

            return $this->paginatedResponse($orders, __('Kitchen tickets retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('KitchenTicket API index error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            if (!Auth::user()->can('manage-kitchen-tickets')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $request->validate([
                'kitchen_status' => 'required|in:pending,in_prep,ready,served,cancelled'
            ]);

            $order = Order::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$order) {
                return $this->errorResponse(__('Order not found'), null, 404);
            }

            $order->kitchen_status = $request->kitchen_status;
            $order->save();

            return $this->successResponse($order, __('Kitchen status updated successfully'));
        } catch (\Exception $e) {
            Log::error('KitchenTicket API updateStatus error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
