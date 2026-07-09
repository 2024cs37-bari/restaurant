<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Zerp\Restaurant\Http\Requests\StoreMenuCategoryRequest;
use Zerp\Restaurant\Http\Requests\UpdateMenuCategoryRequest;
use Zerp\Restaurant\Models\MenuCategory;

class MenuCategoryController extends Controller
{
    public function store(StoreMenuCategoryRequest $request)
    {
        if (!Auth::user()->can('create-menu')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = MenuCategory::where('created_by', creatorId())->max('order') ?? 0;

        MenuCategory::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'order' => $maxOrder + 1,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        return back()->with('success', __('The menu category has been created successfully.'));
    }

    public function update(UpdateMenuCategoryRequest $request, MenuCategory $category)
    {
        if (!Auth::user()->can('edit-menu') || $category->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image' => $validated['image'] ?? $category->image,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', __('The menu category has been updated successfully.'));
    }

    public function destroy(MenuCategory $category)
    {
        if (!Auth::user()->can('delete-menu') || $category->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        if ($category->items()->exists()) {
            return back()->with('error', __('Move or delete this category\'s items before deleting it.'));
        }

        $category->delete();

        return back()->with('success', __('The menu category has been deleted.'));
    }
}
