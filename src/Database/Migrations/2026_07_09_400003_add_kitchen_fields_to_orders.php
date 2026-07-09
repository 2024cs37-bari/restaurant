<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('restaurant_orders', 'fired_at')) {
                $table->timestamp('fired_at')->nullable()->after('status');
            }
        });
        Schema::table('restaurant_order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('restaurant_order_items', 'kitchen_status')) {
                $table->string('kitchen_status', 20)->default('pending')->after('quantity'); // pending | ready | served
            }
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_orders', function (Blueprint $table) {
            if (Schema::hasColumn('restaurant_orders', 'fired_at')) {
                $table->dropColumn('fired_at');
            }
        });
        Schema::table('restaurant_order_items', function (Blueprint $table) {
            if (Schema::hasColumn('restaurant_order_items', 'kitchen_status')) {
                $table->dropColumn('kitchen_status');
            }
        });
    }
};
