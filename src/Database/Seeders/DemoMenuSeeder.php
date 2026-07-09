<?php

namespace Zerp\Restaurant\Database\Seeders;

use Illuminate\Database\Seeder;
use Zerp\Restaurant\Models\MenuCategory;
use Zerp\Restaurant\Models\MenuItem;
use Zerp\Restaurant\Models\ModifierGroup;

class DemoMenuSeeder extends Seeder
{
    public function run($userId): void
    {
        // Categories → items (base prices). Some items get size variations.
        $menu = [
            'Burgers' => [
                ['Classic Cheeseburger', 550, ['Single' => 550, 'Double' => 780]],
                ['Crispy Chicken Burger', 520, []],
                ['Veggie Burger', 470, []],
            ],
            'Pizzas' => [
                ['Margherita', 900, ['Small' => 900, 'Medium' => 1200, 'Large' => 1600]],
                ['Pepperoni', 1100, ['Small' => 1100, 'Medium' => 1450, 'Large' => 1850]],
            ],
            'Sides' => [
                ['Fries', 220, ['Regular' => 220, 'Large' => 320]],
                ['Onion Rings', 260, []],
            ],
            'Drinks' => [
                ['Soft Drink', 150, []],
                ['Fresh Lime', 200, []],
                ['Mineral Water', 90, []],
            ],
        ];

        // Reusable modifier groups.
        $addons = $this->modifierGroup($userId, 'Add-ons', false, [
            ['Extra Cheese', 80], ['Bacon', 120], ['Fried Egg', 60],
        ]);
        $spice = $this->modifierGroup($userId, 'Spice Level', true, [
            ['Mild', 0], ['Medium', 0], ['Hot', 0],
        ]);

        $order = 0;
        foreach ($menu as $categoryName => $items) {
            $category = MenuCategory::firstOrCreate(
                ['name' => $categoryName, 'created_by' => $userId],
                ['is_active' => true, 'order' => ++$order, 'creator_id' => $userId]
            );

            $itemOrder = 0;
            foreach ($items as [$name, $price, $variations]) {
                $item = MenuItem::firstOrCreate(
                    ['name' => $name, 'menu_category_id' => $category->id, 'created_by' => $userId],
                    ['price' => $price, 'is_available' => true, 'order' => ++$itemOrder, 'creator_id' => $userId]
                );

                if ($variations && $item->variations()->count() === 0) {
                    $vo = 0;
                    foreach ($variations as $vName => $vPrice) {
                        $item->variations()->create(['name' => $vName, 'price' => $vPrice, 'order' => $vo++]);
                    }
                }

                // Burgers/Pizzas get add-ons + spice level.
                if (in_array($categoryName, ['Burgers', 'Pizzas'])) {
                    $item->modifierGroups()->syncWithoutDetaching([$addons->id, $spice->id]);
                }
            }
        }
    }

    private function modifierGroup($userId, string $name, bool $required, array $options): ModifierGroup
    {
        $group = ModifierGroup::firstOrCreate(
            ['name' => $name, 'created_by' => $userId],
            ['is_required' => $required, 'min_select' => $required ? 1 : 0, 'max_select' => $required ? 1 : null, 'order' => 0, 'creator_id' => $userId]
        );
        if ($group->options()->count() === 0) {
            $o = 0;
            foreach ($options as [$optName, $optPrice]) {
                $group->options()->create(['name' => $optName, 'price' => $optPrice, 'order' => $o++]);
            }
        }
        return $group;
    }
}
