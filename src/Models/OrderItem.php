<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'restaurant_order_items';

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'menu_item_variation_id',
        'name',
        'unit_price',
        'quantity',
        'line_total',
        'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function modifiers()
    {
        return $this->hasMany(OrderItemModifier::class);
    }
}
