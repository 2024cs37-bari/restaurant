<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('reservations')) {
            return;
        }
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_table_id')->nullable()->constrained('restaurant_tables')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone', 30)->nullable();
            $table->unsignedInteger('party_size')->default(1);
            $table->dateTime('reserved_at');
            $table->string('status', 20)->default('booked'); // booked | seated | cancelled | no_show
            $table->text('notes')->nullable();
            $table->foreignId('creator_id')->nullable()->index();
            $table->foreignId('created_by')->nullable()->index();
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
