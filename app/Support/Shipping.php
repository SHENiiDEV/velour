<?php

namespace App\Support;

/**
 * Доставка по регионам (config/velour.php → shipping). Одна точка правды для
 * страницы Delivery, оформления заказа и серверной валидации страны.
 */
class Shipping
{
    /** @return array<string, array{name:string, window:?string, details:string, fee:string}> */
    public static function regions(): array
    {
        return config('velour.shipping.regions', []);
    }

    /**
     * Страны, доступные в оформлении, с регионом и сроком: 'LV' => ['name' => 'Latvia', 'region' => 'eu', 'window' => '15–25 days'].
     *
     * @return array<string, array{name:string, region:string, window:?string}>
     */
    public static function countries(): array
    {
        $regions = self::regions();
        $out = [];

        foreach (config('velour.shipping.countries_by_region', []) as $region => $countries) {
            foreach ($countries as $code => $name) {
                $out[$code] = [
                    'name' => $name,
                    'region' => $region,
                    'window' => $regions[$region]['window'] ?? null,
                ];
            }
        }

        uasort($out, fn ($a, $b) => strcmp($a['name'], $b['name']));

        return $out;
    }

    /** Shared props для фронта (HandleInertiaRequests и страницы ошибок). */
    public static function shared(): array
    {
        return [
            'currency' => config('velour.currency'),
            'shippingFlatCents' => (int) config('velour.shipping.flat_cents'),
            'freeShippingFromCents' => (int) config('velour.shipping.free_from_cents'),
            'vatNote' => config('velour.vat_note'),
            'dispatchDays' => config('velour.shipping.dispatch_days'),
            'regions' => self::regions(),
            'countries' => self::countries(),
        ];
    }
}
