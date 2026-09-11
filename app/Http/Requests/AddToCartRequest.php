<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'variant_id' => ['required', 'integer', 'exists:variants,id'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.exists' => 'That item does not exist.',
            'qty.max' => 'Ten at a time, no more.',
        ];
    }
}
