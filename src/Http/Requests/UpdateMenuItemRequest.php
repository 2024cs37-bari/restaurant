<?php

namespace Zerp\Restaurant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Scope the category to the current tenant to block cross-tenant assignment.
            'menu_category_id' => 'required|exists:menu_categories,id,created_by,' . creatorId(),
            'kitchen_station_id' => 'nullable|exists:kitchen_stations,id,created_by,' . creatorId(),
            'name' => 'required|max:150',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'prep_time_minutes' => 'nullable|integer|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|string',
            'variations' => 'nullable|array',
            'variations.*.name' => 'required_with:variations|string|max:100',
            'variations.*.price' => 'required_with:variations|numeric|min:0',
            'modifier_group_ids' => 'nullable|array',
            'modifier_group_ids.*' => 'integer',
        ];
    }
}
