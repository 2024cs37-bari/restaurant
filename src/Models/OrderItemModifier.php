<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemModifier extends Model
{
    protected $table = 'restaurant_order_item_modifiers';

    protected $fillable = [
        'order_item_id',
        'modifier_option_id',
        'name',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
