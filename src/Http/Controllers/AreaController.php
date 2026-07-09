<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Zerp\Restaurant\Http\Requests\StoreAreaRequest;
use Zerp\Restaurant\Http\Requests\UpdateAreaRequest;
use Zerp\Restaurant\Models\Area;

class AreaController extends Controller
{
    public function store(StoreAreaRequest $request)
    {
        if (!Auth::user()->can('create-tables')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = Area::where('created_by', creatorId())->max('order') ?? 0;

        Area::create([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
            'order' => $maxOrder + 1,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        return back()->with('success', __('The area has been created successfully.'));
    }

    public function update(UpdateAreaRequest $request, Area $area)
    {
        if (!Auth::user()->can('edit-tables') || $area->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $area->update([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', __('The area has been updated successfully.'));
    }

    public function destroy(Area $area)
    {
        if (!Auth::user()->can('delete-tables') || $area->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        if ($area->tables()->exists()) {
            return back()->with('error', __('Move or delete this area\'s tables before deleting it.'));
        }

        $area->delete();

        return back()->with('success', __('The area has been deleted.'));
    }
}
