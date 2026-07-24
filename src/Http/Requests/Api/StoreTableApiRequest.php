<?php

namespace Zerp\Restaurant\Http\Requests\Api;

use App\Http\Requests\ApiFormRequest;

class StoreTableApiRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'area_id' => 'required|exists:areas,id,created_by,' . creatorId(),
            'name' => 'required|string|max:50',
            'seats' => 'required|integer|min:1|max:50',
            'waiter_id' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ];
    }
}
