<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('recipes')) {
            return;
        }
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            // product_id references a product-service item; kept as a plain column
            // (no cross-package FK) so the restaurant package stays independent.
            $table->unsignedBigInteger('product_id')->index();
            $table->decimal('quantity', 10, 3)->default(0); // ingredient qty per one menu item
            $table->foreignId('created_by')->nullable()->index();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
