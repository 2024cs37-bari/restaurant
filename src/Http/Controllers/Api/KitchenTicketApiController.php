<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Http\Requests\Api\UpdateKitchenStatusApiRequest;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Models\OrderItem;

/**
 * The Kitchen Display System, mirroring the web KitchenController: a ticket is a
 * fired, still-open order and its unserved items. The kitchen state lives on the
 * order items as kitchen_status (pending/ready/served), not on the order (whose
 * own status is open/completed/cancelled), so the list filters items by it and
 * the status update targets an item. See zerp-pk/zerp#27.
 */
class KitchenTicketApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-kitchen')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $orders = Order::where('created_by', creatorId())
                ->where('status', 'open')
                ->whereNotNull('fired_at')
                ->with([
                    'items' => fn ($q) => $q->where('kitchen_status', '!=', 'served'),
                    'items.menuItem:id,name,kitchen_station_id',
                    'table:id,name',
                ])
                ->when($request->station_id, fn ($q) => $q->whereHas(
                    'items.menuItem',
                    fn ($query) => $query->where('kitchen_station_id', $request->station_id)
                ))
                ->orderBy('fired_at')
                ->paginate($request->get('per_page', 10))
                ->withQueryString();

            return $this->paginatedResponse($orders, __('Kitchen tickets retrieved successfully'));
        } catch (\Throwable $e) {
            Log::error('KitchenTicket API index error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    /**
     * Update a single order item's kitchen status. {id} is the order item id.
     * Statuses match the web KDS (pending/ready/served); the item is reachable
     * only when its order belongs to the caller's company.
     */
    public function updateStatus(UpdateKitchenStatusApiRequest $request, $id)
    {
        try {
            if (!Auth::user()->can('edit-kitchen')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $item = OrderItem::where('id', $id)
                ->whereHas('order', fn ($q) => $q->where('created_by', creatorId()))
                ->first();

            if (!$item) {
                return $this->errorResponse(__('Kitchen ticket item not found'), null, 404);
            }

            $item->update(['kitchen_status' => $request->validated()['kitchen_status']]);

            return $this->successResponse($item, __('Kitchen status updated successfully'));
        } catch (\Throwable $e) {
            Log::error('KitchenTicket API updateStatus error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
