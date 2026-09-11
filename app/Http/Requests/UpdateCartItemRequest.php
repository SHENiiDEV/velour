<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'qty' => ['required', 'integer', 'min:0', 'max:10'],
        ];
    }
}
