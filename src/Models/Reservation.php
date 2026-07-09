<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_table_id',
        'customer_name',
        'customer_phone',
        'party_size',
        'reserved_at',
        'status',
        'notes',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'party_size' => 'integer',
    ];

    public function table()
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }
}
