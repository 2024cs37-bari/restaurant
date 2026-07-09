<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    protected $fillable = [
        'menu_item_id',
        'product_id',
        'quantity',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }
}
