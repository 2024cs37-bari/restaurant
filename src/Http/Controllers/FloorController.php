<?php

namespace Zerp\Restaurant\Http\Controllers;

use App\Models\User;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Models\Area;

class FloorController extends Controller
{
    public function index()
    {
        if (!Auth::user()->can('manage-tables')) {
            return back()->with('error', __('Permission denied'));
        }

        $areas = Area::where('created_by', creatorId())
            ->with([
                'tables' => fn ($q) => $q->orderBy('order'),
                'tables.waiter:id,name',
                'tables.mergedTables:id,name,merged_into_id',
            ])
            ->orderBy('order')
            ->get();

        return Inertia::render('Restaurant/Floor/Index', [
            'areas' => $areas,
            'waiters' => User::where('created_by', creatorId())
                ->where('type', '!=', 'client')
                ->get(['id', 'name']),
        ]);
    }
}
