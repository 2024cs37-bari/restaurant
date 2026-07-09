<?php

namespace Zerp\Restaurant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'area_id' => 'required|exists:areas,id,created_by,' . creatorId(),
            'name' => 'required|max:50',
            'seats' => 'required|integer|min:1|max:50',
            'waiter_id' => 'nullable|integer',
            'is_active' => 'boolean',
        ];
    }
}
