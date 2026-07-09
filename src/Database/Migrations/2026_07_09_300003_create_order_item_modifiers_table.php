<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('restaurant_order_item_modifiers')) {
            return;
        }
        Schema::create('restaurant_order_item_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('restaurant_order_items')->cascadeOnDelete();
            $table->foreignId('modifier_option_id')->nullable();
            $table->string('name');       // snapshot
            $table->decimal('price', 10, 2)->default(0); // snapshot
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_order_item_modifiers');
    }
};
