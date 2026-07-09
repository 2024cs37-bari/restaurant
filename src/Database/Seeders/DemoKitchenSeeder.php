<?php

namespace Zerp\Restaurant\Database\Seeders;

use Illuminate\Database\Seeder;
use Zerp\Restaurant\Models\KitchenStation;
use Zerp\Restaurant\Models\MenuItem;

class DemoKitchenSeeder extends Seeder
{
    public function run($userId): void
    {
        // Stations, then route demo menu items to them by name.
        $order = 0;
        $stations = [];
        foreach (['Grill', 'Fry', 'Oven', 'Bar'] as $name) {
            $stations[$name] = KitchenStation::firstOrCreate(
                ['name' => $name, 'created_by' => $userId],
                ['is_active' => true, 'order' => ++$order, 'creator_id' => $userId]
            );
        }

        $routes = [
            'Grill' => ['Classic Cheeseburger', 'Crispy Chicken Burger', 'Veggie Burger'],
            'Oven' => ['Margherita', 'Pepperoni'],
            'Fry' => ['Fries', 'Onion Rings'],
            'Bar' => ['Soft Drink', 'Fresh Lime', 'Mineral Water'],
        ];

        foreach ($routes as $stationName => $itemNames) {
            $stationId = $stations[$stationName]->id;
            MenuItem::where('created_by', $userId)
                ->whereIn('name', $itemNames)
                ->whereNull('kitchen_station_id')
                ->update(['kitchen_station_id' => $stationId]);
        }
    }
}
