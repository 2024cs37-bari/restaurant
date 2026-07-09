<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            if (!Schema::hasColumn('menu_items', 'kitchen_station_id')) {
                $table->foreignId('kitchen_station_id')->nullable()->after('menu_category_id')
                    ->constrained('kitchen_stations')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            if (Schema::hasColumn('menu_items', 'kitchen_station_id')) {
                $table->dropConstrainedForeignId('kitchen_station_id');
            }
        });
    }
};
