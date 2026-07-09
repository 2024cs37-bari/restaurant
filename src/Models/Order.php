<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $table = 'restaurant_orders';

    protected $fillable = [
        'order_number',
        'type',
        'restaurant_table_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'status',
        'fired_at',
        'subtotal',
        'discount',
        'total',
        'payment_method',
        'bank_account_id',
        'paid_at',
        'notes',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
        'fired_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function table()
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }

    // Next per-tenant order number, e.g. ORD-0001.
    public static function nextNumber(int $creatorId): string
    {
        $count = static::where('created_by', $creatorId)->count();
        return 'ORD-' . str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }
}
