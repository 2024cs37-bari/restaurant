<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('restaurant_tables')) {
            return;
        }
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('seats')->default(2);
            $table->string('status', 20)->default('free'); // free | seated | reserved
            $table->foreignId('waiter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('pos_x')->default(0);
            $table->integer('pos_y')->default(0);
            $table->foreignId('merged_into_id')->nullable()->constrained('restaurant_tables')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('creator_id')->nullable()->index();
            $table->foreignId('created_by')->nullable()->index();
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};
