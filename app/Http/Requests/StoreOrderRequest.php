<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],

            'shipping_address.name' => ['required', 'string', 'max:120'],
            'shipping_address.line1' => ['required', 'string', 'max:180'],
            'shipping_address.line2' => ['nullable', 'string', 'max:180'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.postcode' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'size:2'],

            'notes' => ['nullable', 'string', 'max:500'],

            // Анонимная упаковка включена по умолчанию; выключить можно только явно.
            'discreet_packaging' => ['nullable', 'boolean'],

            'age_confirmed' => ['accepted'],
            'terms_accepted' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'age_confirmed.accepted' => 'Please confirm that you are 18 or older.',
            'terms_accepted.accepted' => 'Accept the terms to continue.',
            'shipping_address.country.size' => 'Country is a two-letter code (LV, LT, EE…).',
        ];
    }

    /** @return array{email:string, phone:?string, shipping_address:array, notes:?string, discreet_packaging:bool} */
    public function orderData(): array
    {
        return [
            'email' => $this->string('email')->toString(),
            'phone' => $this->input('phone'),
            'shipping_address' => $this->input('shipping_address'),
            'notes' => $this->input('notes'),
            'discreet_packaging' => $this->boolean('discreet_packaging', true),
        ];
    }
}
