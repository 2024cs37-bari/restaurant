<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItemVariation extends Model
{
    protected $fillable = [
        'menu_item_id',
        'name',
        'price',
        'order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'order' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }
}
