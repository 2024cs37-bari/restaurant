<?php

use Illuminate\Support\Facades\Route;
use Zerp\Restaurant\Http\Controllers\Api\DashboardApiController;
use Zerp\Restaurant\Http\Controllers\Api\MenuItemApiController;
use Zerp\Restaurant\Http\Controllers\Api\RestaurantTableApiController;
use Zerp\Restaurant\Http\Controllers\Api\OrderApiController;
use Zerp\Restaurant\Http\Controllers\Api\KitchenTicketApiController;

Route::prefix('api')->middleware(['api.json'])->group(function () {
    Route::group(['middleware' => ['auth:sanctum'], 'prefix' => 'restaurant', 'as' => 'api.restaurant.'], function () {
        // Dashboard
        Route::get('dashboard', [DashboardApiController::class, 'index'])->name('dashboard');

        // Menu Items
        Route::apiResource('menu-items', MenuItemApiController::class);

        // Tables / Floor
        Route::apiResource('tables', RestaurantTableApiController::class);

        // Orders
        Route::apiResource('orders', OrderApiController::class);

        // Kitchen Tickets (KDS)
        Route::get('kitchen-tickets', [KitchenTicketApiController::class, 'index'])->name('kitchen-tickets.index');
        Route::patch('kitchen-tickets/{id}/status', [KitchenTicketApiController::class, 'updateStatus'])->name('kitchen-tickets.update-status');
    });
});
