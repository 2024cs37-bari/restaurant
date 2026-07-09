<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'order',
        'is_active',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function tables()
    {
        return $this->hasMany(RestaurantTable::class)->orderBy('order');
    }
}
