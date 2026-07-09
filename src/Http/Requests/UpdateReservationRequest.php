<?php

namespace Zerp\Restaurant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id,created_by,' . creatorId(),
            'customer_name' => 'required|max:150',
            'customer_phone' => 'nullable|string|max:30',
            'party_size' => 'required|integer|min:1|max:100',
            'reserved_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
