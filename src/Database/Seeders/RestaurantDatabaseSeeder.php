<?php

namespace Zerp\Restaurant\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class RestaurantDatabaseSeeder extends Seeder
{
    public function run()
    {
        Model::unguard();

        $this->call(PermissionTableSeeder::class);

        if (config('app.run_demo_seeder')) {
            $userId = User::where('email', 'company@example.com')->first()->id;
            (new DemoMenuSeeder())->run($userId);
            (new DemoKitchenSeeder())->run($userId);
            (new DemoFloorSeeder())->run($userId);
        }
    }
}
