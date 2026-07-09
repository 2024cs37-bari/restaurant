<?php

namespace Zerp\Restaurant\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Zerp\Restaurant\Http\Requests\StoreTableRequest;
use Zerp\Restaurant\Http\Requests\UpdateTableRequest;
use Zerp\Restaurant\Models\RestaurantTable;

class RestaurantTableController extends Controller
{
    private function owns(RestaurantTable $table): bool
    {
        return $table->created_by == creatorId();
    }

    public function store(StoreTableRequest $request)
    {
        if (!Auth::user()->can('create-tables')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = RestaurantTable::where('area_id', $validated['area_id'])->max('order') ?? 0;

        RestaurantTable::create([
            'area_id' => $validated['area_id'],
            'name' => $validated['name'],
            'seats' => $validated['seats'],
            'waiter_id' => $this->validWaiterId($validated['waiter_id'] ?? null),
            'status' => 'free',
            'order' => $maxOrder + 1,
            'is_active' => $request->boolean('is_active', true),
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        return back()->with('success', __('The table has been created successfully.'));
    }

    public function update(UpdateTableRequest $request, RestaurantTable $table)
    {
        if (!Auth::user()->can('edit-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $table->update([
            'area_id' => $validated['area_id'],
            'name' => $validated['name'],
            'seats' => $validated['seats'],
            'waiter_id' => $this->validWaiterId($validated['waiter_id'] ?? null),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', __('The table has been updated successfully.'));
    }

    public function destroy(RestaurantTable $table)
    {
        if (!Auth::user()->can('delete-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }

        $table->delete();

        return back()->with('success', __('The table has been deleted.'));
    }

    public function setStatus(Request $request, RestaurantTable $table)
    {
        if (!Auth::user()->can('edit-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validate(['status' => 'required|in:free,seated,reserved']);

        $table->update(['status' => $validated['status']]);

        return back()->with('success', __('Table status updated.'));
    }

    public function assignWaiter(Request $request, RestaurantTable $table)
    {
        if (!Auth::user()->can('edit-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }
        $request->validate(['waiter_id' => 'nullable|integer']);

        $table->update(['waiter_id' => $this->validWaiterId($request->input('waiter_id'))]);

        return back()->with('success', __('Waiter updated.'));
    }

    public function position(Request $request, RestaurantTable $table)
    {
        if (!Auth::user()->can('edit-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validate([
            'pos_x' => 'required|integer',
            'pos_y' => 'required|integer',
        ]);

        $table->update(['pos_x' => $validated['pos_x'], 'pos_y' => $validated['pos_y']]);

        return back()->with('success', __('Position saved.'));
    }

    public function merge(Request $request)
    {
        if (!Auth::user()->can('edit-tables')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validate([
            'primary_id' => 'required|integer',
            'table_ids' => 'required|array|min:1',
            'table_ids.*' => 'integer',
        ]);

        // All tables must belong to the tenant and be free.
        $ids = array_merge([$validated['primary_id']], $validated['table_ids']);
        $tables = RestaurantTable::whereIn('id', $ids)->where('created_by', creatorId())->get();
        if ($tables->count() !== count(array_unique($ids)) || $tables->contains(fn ($t) => $t->status !== 'free')) {
            return back()->with('error', __('Only your own free tables can be merged.'));
        }

        RestaurantTable::whereIn('id', $validated['table_ids'])
            ->where('id', '!=', $validated['primary_id'])
            ->where('created_by', creatorId())
            ->update(['merged_into_id' => $validated['primary_id']]);

        return back()->with('success', __('Tables merged.'));
    }

    public function split(RestaurantTable $table)
    {
        if (!Auth::user()->can('edit-tables') || !$this->owns($table)) {
            return back()->with('error', __('Permission denied'));
        }

        // Split the whole group the table belongs to: the primary is the table
        // itself (if others point at it) or its merged_into target.
        $primaryId = $table->merged_into_id ?: $table->id;
        RestaurantTable::where('created_by', creatorId())
            ->where(fn ($q) => $q->where('merged_into_id', $primaryId)->orWhere('id', $primaryId))
            ->update(['merged_into_id' => null]);

        return back()->with('success', __('Tables split.'));
    }

    // Only accept a waiter that is a staff user of the current tenant.
    private function validWaiterId($waiterId): ?int
    {
        if (empty($waiterId)) {
            return null;
        }
        $ok = User::where('id', $waiterId)
            ->where(fn ($q) => $q->where('created_by', creatorId())->orWhere('id', creatorId()))
            ->exists();

        return $ok ? (int) $waiterId : null;
    }
}
