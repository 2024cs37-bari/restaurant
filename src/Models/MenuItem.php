<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_category_id',
        'kitchen_station_id',
        'name',
        'description',
        'price',
        'image',
        'prep_time_minutes',
        'is_available',
        'order',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'prep_time_minutes' => 'integer',
        'order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function station()
    {
        return $this->belongsTo(KitchenStation::class, 'kitchen_station_id');
    }

    public function variations()
    {
        return $this->hasMany(MenuItemVariation::class)->orderBy('order');
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'menu_item_modifier_group')
            ->withPivot('order')
            ->orderBy('order');
    }
}
