<?php

namespace Zerp\Restaurant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettleOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|string|max:30',
            'bank_account_id' => 'nullable|integer',
            'discount' => 'nullable|numeric|min:0',
        ];
    }
}
