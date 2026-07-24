<?php

namespace Zerp\Restaurant\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\MenuItem;
use Zerp\Restaurant\Http\Requests\Api\StoreMenuItemApiRequest;
use Zerp\Restaurant\Http\Requests\Api\UpdateMenuItemApiRequest;

class MenuItemApiController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        try {
            if (!Auth::user()->can('manage-menu')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $items = MenuItem::query()
                ->with(['category', 'kitchenStation', 'variations', 'modifierGroups'])
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-menu')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-menu')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->when($request->search, function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                })
                ->when($request->menu_category_id, fn($q) => $q->where('menu_category_id', $request->menu_category_id))
                ->latest()
                ->paginate($request->get('per_page', 10))
                ->withQueryString();

            return $this->paginatedResponse($items, __('Menu items retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('MenuItem API index error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function store(StoreMenuItemApiRequest $request)
    {
        try {
            if (!Auth::user()->can('create-menu')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $validated = $request->validated();

            $item = new MenuItem();
            $item->menu_category_id = $validated['menu_category_id'];
            $item->kitchen_station_id = $validated['kitchen_station_id'] ?? null;
            $item->name = $validated['name'];
            $item->description = $validated['description'] ?? null;
            $item->price = $validated['price'];
            $item->prep_time_minutes = $validated['prep_time_minutes'] ?? null;
            $item->is_available = $request->boolean('is_available', true);
            $item->image = $validated['image'] ?? null;
            $item->creator_id = Auth::id();
            $item->created_by = creatorId();
            $item->save();

            return $this->successResponse($item, __('Menu item created successfully'), 201);
        } catch (\Exception $e) {
            Log::error('MenuItem API store error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function show($id)
    {
        try {
            if (!Auth::user()->can('manage-menu')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $item = MenuItem::with(['category', 'kitchenStation', 'variations', 'modifierGroups'])
                ->where('id', $id)
                ->where(function($q) {
                    if (Auth::user()->can('manage-any-menu')) {
                        $q->where('created_by', creatorId());
                    } elseif (Auth::user()->can('manage-own-menu')) {
                        $q->where('creator_id', Auth::id());
                    } else {
                        $q->whereRaw('1 = 0');
                    }
                })
                ->first();

            if (!$item) {
                return $this->errorResponse(__('Menu item not found'), null, 404);
            }

            return $this->successResponse($item, __('Menu item details retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('MenuItem API show error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function update(UpdateMenuItemApiRequest $request, $id)
    {
        try {
            if (!Auth::user()->can('edit-menu')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $item = MenuItem::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$item) {
                return $this->errorResponse(__('Menu item not found'), null, 404);
            }

            $validated = $request->validated();

            $item->menu_category_id = $validated['menu_category_id'];
            $item->kitchen_station_id = $validated['kitchen_station_id'] ?? null;
            $item->name = $validated['name'];
            $item->description = $validated['description'] ?? null;
            $item->price = $validated['price'];
            $item->prep_time_minutes = $validated['prep_time_minutes'] ?? null;
            $item->is_available = $request->boolean('is_available', true);
            $item->image = $validated['image'] ?? null;
            $item->save();

            return $this->successResponse($item, __('Menu item updated successfully'));
        } catch (\Exception $e) {
            Log::error('MenuItem API update error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            if (!Auth::user()->can('delete-menu')) {
                return $this->errorResponse(__('Permission denied'), null, 403);
            }

            $item = MenuItem::where('id', $id)
                ->where('created_by', creatorId())
                ->first();

            if (!$item) {
                return $this->errorResponse(__('Menu item not found'), null, 404);
            }

            $item->delete();

            return $this->successResponse(null, __('Menu item deleted successfully'));
        } catch (\Exception $e) {
            Log::error('MenuItem API destroy error', ['e' => $e]);
            return $this->errorResponse(__('Something went wrong'), null, 500);
        }
    }
}
