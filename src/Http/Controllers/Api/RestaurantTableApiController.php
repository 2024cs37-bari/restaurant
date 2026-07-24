<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\RestaurantTable;
use Zerp\Restaurant\Http\Requests\Api\StoreTableApiRequest;
use Zerp\Restaurant\Http\Requests\Api\UpdateTableApiRequest;

class RestaurantTableApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-restaurant-tables')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $tables = RestaurantTable::query()
                ->with('area')
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-restaurant-tables')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-restaurant-tables')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when($request->area_id, fn($q) => $q->where('area_id', $request->area_id))
                ->when($request->status, fn($q) => $q->where('status', $request->status))
                ->latest()
                ->paginate($request->get('per_page', 10))
                ->withQueryString();

            return $this->paginatedResponse($tables, __('Tables retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('RestaurantTable API index error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function store(StoreTableApiRequest $request)
    {
        try {
            if (!Auth::user()->can('create-restaurant-tables')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $validated = $request->validated();

            $table = new RestaurantTable();
            $table->area_id = $validated['area_id'];
            $table->name = $validated['name'];
            $table->seats = $validated['seats'];
            $table->waiter_id = $validated['waiter_id'] ?? null;
            $table->is_active = $request->boolean('is_active', true);
            $table->status = 'available';
            $table->creator_id = Auth::id();
            $table->created_by = creatorId();
            $table->save();

            return $this->successResponse($table, __('Table created successfully'), 201);
        } catch (\Exception $e) {
            Log::error('RestaurantTable API store error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function show($id)
    {
        try {
            if (!Auth::user()->can('manage-restaurant-tables')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $table = RestaurantTable::with('area')
                ->where('id', $id)
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-restaurant-tables')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-restaurant-tables')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->first();

            if (!$table) {
                return $this->errorResponse(__('Table not found'), null, 404);
            }

            return $this->successResponse($table, __('Table details retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('RestaurantTable API show error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function update(UpdateTableApiRequest $request, $id)
    {
        try {
            if (!Auth::user()->can('edit-restaurant-tables')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $table = RestaurantTable::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$table) {
                return $this->errorResponse(__('Table not found'), null, 404);
            }

            $validated = $request->validated();

            $table->area_id = $validated['area_id'];
            $table->name = $validated['name'];
            $table->seats = $validated['seats'];
            $table->waiter_id = $validated['waiter_id'] ?? null;
            $table->is_active = $request->boolean('is_active', true);
            $table->save();

            return $this->successResponse($table, __('Table updated successfully'));
        } catch (\Exception $e) {
            Log::error('RestaurantTable API update error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            if (!Auth::user()->can('delete-restaurant-tables')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $table = RestaurantTable::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$table) {
                return $this->errorResponse(__('Table not found'), null, 404);
            }

            $table->delete();

            return $this->successResponse(null, __('Table deleted successfully'));
        } catch (\Exception $e) {
            Log::error('RestaurantTable API destroy error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
