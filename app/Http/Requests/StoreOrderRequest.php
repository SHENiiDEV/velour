<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    /** Формат индекса по странам доставки (В9). Страны без шаблона — любой разумный ввод. */
    public const POSTCODES = [
        'LV' => '/^(LV-?)?\d{4}$/i',
        'LT' => '/^(LT-?)?\d{5}$/i',
        'EE' => '/^\d{5}$/',
        'FI' => '/^\d{5}$/',
        'PL' => '/^\d{2}-?\d{3}$/',
        'DE' => '/^\d{5}$/',
        'FR' => '/^\d{5}$/',
        'NL' => '/^\d{4}\s?[A-Z]{2}$/i',
        'SE' => '/^\d{3}\s?\d{2}$/',
    ];

    public function rules(): array
    {
        $country = strtoupper((string) $this->input('shipping_address.country'));

        return [
            'email' => ['required', 'email:rfc', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32', 'regex:/^\+?[0-9][0-9 ()\-]{5,24}$/'],

            'shipping_address.name' => ['required', 'string', 'min:2', 'max:120'],
            'shipping_address.line1' => ['required', 'string', 'min:3', 'max:180'],
            'shipping_address.line2' => ['nullable', 'string', 'max:180'],
            'shipping_address.city' => ['required', 'string', 'min:2', 'max:120'],
            'shipping_address.postcode' => [
                'required', 'string', 'max:20',
                'regex:'.(self::POSTCODES[$country] ?? '/^[A-Za-z0-9 \-]{3,10}$/'),
            ],
            // Только страны, куда есть доставка (config/velour.php → shipping.countries).
            'shipping_address.country' => ['required', 'string', Rule::in(array_keys(config('velour.shipping.countries', [])))],

            'notes' => ['nullable', 'string', 'max:500'],

            // Анонимная упаковка включена по умолчанию; выключить можно только явно.
            'discreet_packaging' => ['nullable', 'boolean'],

            'age_confirmed' => ['accepted'],
            'terms_accepted' => ['accepted'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $address = (array) $this->input('shipping_address', []);
        if (isset($address['country'])) {
            $address['country'] = strtoupper(trim((string) $address['country']));
        }
        if (isset($address['postcode'])) {
            $address['postcode'] = trim((string) $address['postcode']);
        }
        $this->merge(['shipping_address' => $address]);
    }

    /** Человеческие названия полей вместо «shipping address.name» (В9). */
    public function attributes(): array
    {
        return [
            'email' => 'email',
            'phone' => 'phone number',
            'shipping_address.name' => "recipient's name",
            'shipping_address.line1' => 'street and house number',
            'shipping_address.line2' => 'flat or pickup point',
            'shipping_address.city' => 'city',
            'shipping_address.postcode' => 'postal code',
            'shipping_address.country' => 'country',
        ];
    }

    public function messages(): array
    {
        $country = strtoupper((string) $this->input('shipping_address.country'));
        $hint = [
            'LV' => 'LV-1010', 'LT' => 'LT-01100', 'EE' => '10111', 'FI' => '00100', 'PL' => '00-001',
            'DE' => '10115', 'FR' => '75001', 'NL' => '1012 AB', 'SE' => '111 22',
        ][$country] ?? null;

        return [
            'email.required' => 'Please enter your email — we send the order confirmation there.',
            'email.email' => 'This email address does not look right.',
            'phone.regex' => 'Please enter a phone number with digits only, e.g. +371 20 000 000.',
            'shipping_address.name.required' => "Please enter the recipient's name.",
            'shipping_address.line1.required' => 'Please enter the street and house number.',
            'shipping_address.city.required' => 'Please enter the city.',
            'shipping_address.postcode.required' => 'Please enter the postal code.',
            'shipping_address.postcode.regex' => $hint ? "This postal code does not look right — e.g. {$hint}." : 'This postal code does not look right.',
            'shipping_address.country.in' => 'We do not deliver to this country yet.',
            'age_confirmed.accepted' => 'Please confirm that you are 18 or older.',
            'terms_accepted.accepted' => 'Please accept the Terms of sale to continue.',
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
