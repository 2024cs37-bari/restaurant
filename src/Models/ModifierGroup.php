<?php

namespace Zerp\Restaurant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ModifierGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_select',
        'max_select',
        'is_required',
        'order',
        'creator_id',
        'created_by',
    ];

    protected $casts = [
        'min_select' => 'integer',
        'max_select' => 'integer',
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(ModifierOption::class)->orderBy('order');
    }
}
