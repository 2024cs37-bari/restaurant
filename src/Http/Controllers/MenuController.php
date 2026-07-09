<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Models\MenuCategory;
use Zerp\Restaurant\Models\ModifierGroup;
use Zerp\Restaurant\Models\KitchenStation;

class MenuController extends Controller
{
    public function index()
    {
        if (!Auth::user()->can('manage-menu')) {
            return back()->with('error', __('Permission denied'));
        }

        $categories = MenuCategory::where('created_by', creatorId())
            ->with([
                'items' => fn ($q) => $q->orderBy('order'),
                'items.variations',
                'items.modifierGroups.options',
                'items.recipe',
            ])
            ->orderBy('order')
            ->get();

        // Ingredient catalog for recipes comes from the product-service module.
        $products = [];
        if (class_exists(\Zerp\ProductService\Models\ProductServiceItem::class)) {
            $products = \Zerp\ProductService\Models\ProductServiceItem::where('created_by', creatorId())
                ->where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit']);
        }

        return Inertia::render('Restaurant/Menu/Index', [
            'categories' => $categories,
            'modifierGroups' => ModifierGroup::where('created_by', creatorId())
                ->with('options')->orderBy('order')->get(),
            'stations' => KitchenStation::where('created_by', creatorId())
                ->orderBy('order')->get(['id', 'name']),
            'products' => $products,
        ]);
    }
}
