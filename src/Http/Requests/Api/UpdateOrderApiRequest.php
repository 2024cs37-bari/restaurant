<?php

namespace Zerp\Restaurant\Http\Requests\Api;

use App\Http\Requests\ApiFormRequest;

class UpdateOrderApiRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'type' => 'required|in:dine_in,takeaway,delivery',
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id,created_by,' . creatorId(),
            'customer_name' => 'nullable|string|max:150',
            'customer_phone' => 'nullable|string|max:30',
            'customer_address' => 'nullable|string|max:255',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'lines' => 'nullable|array',
            'lines.*.menu_item_id' => 'required_with:lines|integer',
            'lines.*.menu_item_variation_id' => 'nullable|integer',
            'lines.*.modifier_option_ids' => 'nullable|array',
            'lines.*.modifier_option_ids.*' => 'integer',
            'lines.*.quantity' => 'required_with:lines|integer|min:1',
            'lines.*.notes' => 'nullable|string|max:255',
        ];
    }
}
