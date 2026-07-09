<?php

namespace Zerp\Restaurant\Database\Seeders;

use Illuminate\Database\Seeder;
use Zerp\Restaurant\Models\Area;
use Zerp\Restaurant\Models\RestaurantTable;

class DemoFloorSeeder extends Seeder
{
    public function run($userId): void
    {
        // Areas, each with a few tables laid out on the floor-plan grid.
        $layout = [
            'Indoor' => [['T1', 2], ['T2', 4], ['T3', 4], ['T4', 6]],
            'Terrace' => [['T5', 2], ['T6', 2], ['T7', 4]],
        ];

        $areaOrder = 0;
        foreach ($layout as $areaName => $tables) {
            $area = Area::firstOrCreate(
                ['name' => $areaName, 'created_by' => $userId],
                ['is_active' => true, 'order' => ++$areaOrder, 'creator_id' => $userId]
            );

            $i = 0;
            foreach ($tables as [$name, $seats]) {
                RestaurantTable::firstOrCreate(
                    ['name' => $name, 'area_id' => $area->id, 'created_by' => $userId],
                    [
                        'seats' => $seats,
                        'status' => 'free',
                        'order' => $i + 1,
                        'pos_x' => 20 + ($i % 3) * 140,
                        'pos_y' => 20 + intdiv($i, 3) * 120,
                        'is_active' => true,
                        'creator_id' => $userId,
                    ]
                );
                $i++;
            }
        }
    }
}
