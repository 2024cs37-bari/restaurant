<?php

use Illuminate\Support\Facades\Route;
use Zerp\Restaurant\Http\Controllers\MenuController;
use Zerp\Restaurant\Http\Controllers\MenuCategoryController;
use Zerp\Restaurant\Http\Controllers\MenuItemController;
use Zerp\Restaurant\Http\Controllers\ModifierGroupController;
use Zerp\Restaurant\Http\Controllers\FloorController;
use Zerp\Restaurant\Http\Controllers\AreaController;
use Zerp\Restaurant\Http\Controllers\RestaurantTableController;
use Zerp\Restaurant\Http\Controllers\ReservationController;
use Zerp\Restaurant\Http\Controllers\OrderController;

Route::middleware(['web', 'auth', 'verified', 'PlanModuleCheck:Restaurant'])->group(function () {
    Route::get('restaurant/menu', [MenuController::class, 'index'])->name('restaurant.menu.index');

    Route::prefix('restaurant/menu-categories')->name('restaurant.menu-categories.')->group(function () {
        Route::post('/', [MenuCategoryController::class, 'store'])->name('store');
        Route::put('/{category}', [MenuCategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [MenuCategoryController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('restaurant/menu-items')->name('restaurant.menu-items.')->group(function () {
        Route::post('/', [MenuItemController::class, 'store'])->name('store');
        Route::put('/{item}', [MenuItemController::class, 'update'])->name('update');
        Route::delete('/{item}', [MenuItemController::class, 'destroy'])->name('destroy');
        Route::post('/{item}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->name('toggle-availability');
    });

    Route::prefix('restaurant/modifier-groups')->name('restaurant.modifier-groups.')->group(function () {
        Route::get('/', [ModifierGroupController::class, 'index'])->name('index');
        Route::post('/', [ModifierGroupController::class, 'store'])->name('store');
        Route::put('/{modifierGroup}', [ModifierGroupController::class, 'update'])->name('update');
        Route::delete('/{modifierGroup}', [ModifierGroupController::class, 'destroy'])->name('destroy');
    });

    // Floor & tables
    Route::get('restaurant/floor', [FloorController::class, 'index'])->name('restaurant.floor.index');

    Route::prefix('restaurant/areas')->name('restaurant.areas.')->group(function () {
        Route::post('/', [AreaController::class, 'store'])->name('store');
        Route::put('/{area}', [AreaController::class, 'update'])->name('update');
        Route::delete('/{area}', [AreaController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('restaurant/tables')->name('restaurant.tables.')->group(function () {
        Route::post('/', [RestaurantTableController::class, 'store'])->name('store');
        Route::post('/merge', [RestaurantTableController::class, 'merge'])->name('merge');
        Route::put('/{table}', [RestaurantTableController::class, 'update'])->name('update');
        Route::delete('/{table}', [RestaurantTableController::class, 'destroy'])->name('destroy');
        Route::post('/{table}/status', [RestaurantTableController::class, 'setStatus'])->name('status');
        Route::post('/{table}/assign-waiter', [RestaurantTableController::class, 'assignWaiter'])->name('assign-waiter');
        Route::post('/{table}/position', [RestaurantTableController::class, 'position'])->name('position');
        Route::post('/{table}/split', [RestaurantTableController::class, 'split'])->name('split');
    });

    Route::prefix('restaurant/reservations')->name('restaurant.reservations.')->group(function () {
        Route::get('/', [ReservationController::class, 'index'])->name('index');
        Route::post('/', [ReservationController::class, 'store'])->name('store');
        Route::put('/{reservation}', [ReservationController::class, 'update'])->name('update');
        Route::delete('/{reservation}', [ReservationController::class, 'destroy'])->name('destroy');
        Route::post('/{reservation}/seat', [ReservationController::class, 'seat'])->name('seat');
        Route::post('/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('cancel');
        Route::post('/{reservation}/no-show', [ReservationController::class, 'noShow'])->name('no-show');
    });

    // Orders & POS
    Route::get('restaurant/pos', [OrderController::class, 'pos'])->name('restaurant.pos.index');
    Route::prefix('restaurant/orders')->name('restaurant.orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update');
        Route::post('/{order}/settle', [OrderController::class, 'settle'])->name('settle');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });
});
