<?php

namespace Zerp\Restaurant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModifierGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|max:100',
            'min_select' => 'nullable|integer|min:0',
            'max_select' => 'nullable|integer|gte:min_select',
            'is_required' => 'boolean',
            'options' => 'nullable|array',
            'options.*.name' => 'required_with:options|string|max:100',
            'options.*.price' => 'required_with:options|numeric|min:0',
        ];
    }
}
