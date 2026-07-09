<?php

namespace Zerp\Restaurant\Database\Seeders;

use Illuminate\Database\Seeder;

class RestaurantDatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call(PermissionTableSeeder::class);
    }
}
