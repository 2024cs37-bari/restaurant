<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Http\Requests\StoreKitchenStationRequest;
use Zerp\Restaurant\Http\Requests\UpdateKitchenStationRequest;
use Zerp\Restaurant\Models\KitchenStation;

class KitchenStationController extends Controller
{
    public function index()
    {
        if (!Auth::user()->can('manage-kitchen')) {
            return back()->with('error', __('Permission denied'));
        }

        return Inertia::render('Restaurant/KitchenStations/Index', [
            'stations' => KitchenStation::where('created_by', creatorId())
                ->orderBy('order')->get(),
        ]);
    }

    public function store(StoreKitchenStationRequest $request)
    {
        if (!Auth::user()->can('create-kitchen')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $maxOrder = KitchenStation::where('created_by', creatorId())->max('order') ?? 0;

        KitchenStation::create([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
            'order' => $maxOrder + 1,
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        return back()->with('success', __('The kitchen station has been created successfully.'));
    }

    public function update(UpdateKitchenStationRequest $request, KitchenStation $station)
    {
        if (!Auth::user()->can('edit-kitchen') || $station->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        $station->update([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', __('The kitchen station has been updated successfully.'));
    }

    public function destroy(KitchenStation $station)
    {
        if (!Auth::user()->can('delete-kitchen') || $station->created_by != creatorId()) {
            return back()->with('error', __('Permission denied'));
        }

        $station->delete();

        return back()->with('success', __('The kitchen station has been deleted.'));
    }
}
