<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\Order;
use Zerp\Restaurant\Http\Requests\Api\StoreOrderApiRequest;
use Zerp\Restaurant\Http\Requests\Api\UpdateOrderApiRequest;
use Zerp\Restaurant\Support\OrderBuilder;

class OrderApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-orders')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $orders = Order::query()
                ->with(['table', 'items.menuItem', 'items.variation'])
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-orders')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-orders')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->when($request->type, fn($q) => $q->where('type', $request->type))
                ->when($request->search, function($q) use ($request) {
                    $q->where('order_number', 'like', '%' . $request->search . '%')
                      ->orWhere('customer_name', 'like', '%' . $request->search . '%');
                })
                ->latest()
                ->paginate($request->get('per_page', 10))
                ->withQueryString();

            return $this->paginatedResponse($orders, __('Orders retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Order API index error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function store(StoreOrderApiRequest $request, OrderBuilder $builder)
    {
        try {
            if (!Auth::user()->can('create-orders')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $validated = $request->validated();
            $order = $builder->create($validated);

            return $this->successResponse($order, __('Order created successfully'), 201);
        } catch (\Exception $e) {
            Log::error('Order API store error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function show($id)
    {
        try {
            if (!Auth::user()->can('manage-orders')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $order = Order::with(['table', 'items.menuItem', 'items.variation', 'items.modifiers.modifierOption'])
                ->where('id', $id)
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-orders')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-orders')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->first();

            if (!$order) {
                return $this->errorResponse(__('Order not found'), null, 404);
            }

            return $this->successResponse($order, __('Order details retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Order API show error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function update(UpdateOrderApiRequest $request, $id)
    {
        try {
            if (!Auth::user()->can('edit-orders')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $order = Order::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$order) {
                return $this->errorResponse(__('Order not found'), null, 404);
            }

            $validated = $request->validated();

            if (!empty($validated['type'])) $order->type = $validated['type'];
            if (isset($validated['customer_name'])) $order->customer_name = $validated['customer_name'];
            if (isset($validated['customer_phone'])) $order->customer_phone = $validated['customer_phone'];
            if (isset($validated['notes'])) $order->notes = $validated['notes'];
            $order->save();

            return $this->successResponse($order, __('Order updated successfully'));
        } catch (\Exception $e) {
            Log::error('Order API update error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            if (!Auth::user()->can('delete-orders')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $order = Order::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$order) {
                return $this->errorResponse(__('Order not found'), null, 404);
            }

            $order->delete();

            return $this->successResponse(null, __('Order deleted successfully'));
        } catch (\Exception $e) {
            Log::error('Order API destroy error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
