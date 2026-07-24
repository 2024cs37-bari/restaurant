<?php

namespace Zerp\Restaurant\Http\Requests\Api;

use App\Http\Requests\ApiFormRequest;

/**
 * Body for PATCH /api/restaurant/kitchen-tickets/{id}/status. A FormRequest so
 * a bad status returns the shared 422 envelope; an inline validate() inside the
 * controller's try/catch would be swallowed into a 500. See zerp-pk/zerp#27.
 */
class UpdateKitchenStatusApiRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'kitchen_status' => 'required|in:pending,ready,served',
        ];
    }
}
