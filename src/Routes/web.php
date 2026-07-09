<?php

use Illuminate\Support\Facades\Route;
use Zerp\Restaurant\Http\Controllers\MenuController;
use Zerp\Restaurant\Http\Controllers\MenuCategoryController;
use Zerp\Restaurant\Http\Controllers\MenuItemController;
use Zerp\Restaurant\Http\Controllers\ModifierGroupController;

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
});
