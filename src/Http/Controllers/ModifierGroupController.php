<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Http\Requests\StoreModifierGroupRequest;
use Zerp\Restaurant\Http\Requests\UpdateModifierGroupRequest;
use Zerp\Restaurant\Models\ModifierGroup;

class ModifierGroupController extends Controller
{
    public function index()
    {
        if (!Auth::user()->can('manage-modifier-groups')) {
            return back()->with('error', __('Permission denied'));
        }

        return Inertia::render('Restaurant/ModifierGroups/Index', [
            'groups' => ModifierGroup::where('created_by', creatorId())
                ->with('options')->orderBy('order')->get(),
        ]);
    }

    public function store(StoreModifierGroupRequest $request)
    {
        if (!Auth::user()->can('create-modifier-groups')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = ModifierGroup::where('created_by', creatorId())->max('order') ?? 0;

        $group = ModifierGroup::create([
            'name' => $validated['name'],
            'min_select' => $validated['min_select'] ?? 0,
            'max_select' => $validated['max_select'] ?? null,
            'is_required' => $request->boolean('is_required', false),
            'order' => $maxOrder + 1,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        $this->syncOptions($group, $validated['options'] ?? []);

        return back()->with('success', __('The modifier group has been created successfully.'));
    }

    public function update(UpdateModifierGroupRequest $request, ModifierGroup $modifierGroup)
    {
        if (!Auth::user()->can('edit-modifier-groups') || $modifierGroup->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $modifierGroup->update([
            'name' => $validated['name'],
            'min_select' => $validated['min_select'] ?? 0,
            'max_select' => $validated['max_select'] ?? null,
            'is_required' => $request->boolean('is_required', false),
        ]);

        $this->syncOptions($modifierGroup, $validated['options'] ?? []);

        return back()->with('success', __('The modifier group has been updated successfully.'));
    }

    public function destroy(ModifierGroup $modifierGroup)
    {
        if (!Auth::user()->can('delete-modifier-groups') || $modifierGroup->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        $modifierGroup->delete();

        return back()->with('success', __('The modifier group has been deleted.'));
    }

    private function syncOptions(ModifierGroup $group, array $options): void
    {
        $group->options()->delete();
        foreach (array_values($options) as $i => $o) {
            $group->options()->create([
                'name' => $o['name'],
                'price' => $o['price'],
                'order' => $i,
            ]);
        }
    }
}
