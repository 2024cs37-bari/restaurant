<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Zerp\Restaurant\Http\Requests\StoreMenuItemRequest;
use Zerp\Restaurant\Http\Requests\UpdateMenuItemRequest;
use Zerp\Restaurant\Models\MenuItem;
use Zerp\Restaurant\Models\ModifierGroup;

class MenuItemController extends Controller
{
    public function store(StoreMenuItemRequest $request)
    {
        if (!Auth::user()->can('create-menu')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = MenuItem::where('menu_category_id', $validated['menu_category_id'])->max('order') ?? 0;

        $item = MenuItem::create([
            'menu_category_id' => $validated['menu_category_id'],
            'kitchen_station_id' => $validated['kitchen_station_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image' => $validated['image'] ?? null,
            'prep_time_minutes' => $validated['prep_time_minutes'] ?? null,
            'is_available' => $request->boolean('is_available', true),
            'order' => $maxOrder + 1,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        $this->syncVariations($item, $validated['variations'] ?? []);
        $this->syncModifierGroups($item, $validated['modifier_group_ids'] ?? []);

        return back()->with('success', __('The menu item has been created successfully.'));
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $item)
    {
        if (!Auth::user()->can('edit-menu') || $item->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $item->update([
            'menu_category_id' => $validated['menu_category_id'],
            'kitchen_station_id' => $validated['kitchen_station_id'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image' => $validated['image'] ?? $item->image,
            'prep_time_minutes' => $validated['prep_time_minutes'] ?? null,
            'is_available' => $request->boolean('is_available', true),
        ]);

        $this->syncVariations($item, $validated['variations'] ?? []);
        $this->syncModifierGroups($item, $validated['modifier_group_ids'] ?? []);

        return back()->with('success', __('The menu item has been updated successfully.'));
    }

    public function destroy(MenuItem $item)
    {
        if (!Auth::user()->can('delete-menu') || $item->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        $item->delete();

        return back()->with('success', __('The menu item has been deleted.'));
    }

    public function toggleAvailability(MenuItem $item)
    {
        if (!Auth::user()->can('edit-menu') || $item->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        $item->update(['is_available' => !$item->is_available]);

        return back()->with('success', __('Availability updated.'));
    }

    private function syncVariations(MenuItem $item, array $variations): void
    {
        $item->variations()->delete();
        foreach (array_values($variations) as $i => $v) {
            $item->variations()->create([
                'name' => $v['name'],
                'price' => $v['price'],
                'order' => $i,
            ]);
        }
    }

    private function syncModifierGroups(MenuItem $item, array $groupIds): void
    {
        // Only allow attaching modifier groups the tenant owns.
        $allowed = ModifierGroup::where('created_by', creatorId())
            ->whereIn('id', $groupIds)->pluck('id')->all();
        $item->modifierGroups()->sync($allowed);
    }
}
