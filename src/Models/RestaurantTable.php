<?php

namespace Zerp\Restaurant\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $fillable = [
        'area_id',
        'name',
        'seats',
        'status',
        'waiter_id',
        'pos_x',
        'pos_y',
        'merged_into_id',
        'order',
        'is_active',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'seats' => 'integer',
        'pos_x' => 'integer',
        'pos_y' => 'integer',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function waiter()
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    public function mergedInto()
    {
        return $this->belongsTo(RestaurantTable::class, 'merged_into_id');
    }

    public function mergedTables()
    {
        return $this->hasMany(RestaurantTable::class, 'merged_into_id');
    }
}
