<?php

return [
    /*
    | Куда уводим при «быстром выходе» и при отказе на age-gate.
    | Нейтральный сайт без следов в истории (фронт делает location.replace).
    */
    /*
    | Секретный обход age-gate для тестов и превью: /?preview=<токен>.
    | Пусто — обход выключен. Используй длинную случайную строку (Str::random(32)).
    */
    'age_gate_bypass_token' => env('AGE_GATE_BYPASS_TOKEN', ''),

    'exit_url' => env('VELOUR_EXIT_URL', 'https://www.google.com'),

    /*
    | Нейтральное имя в выписке по карте (передаётся платёжному провайдеру).
    | Покупатель видит эту строку в банковском приложении — она не должна
    | ничего сообщать о содержимом заказа.
    */
    'statement_descriptor' => env('VELOUR_STATEMENT_DESCRIPTOR', 'VLR RETAIL'),

    /*
    | Анонимная упаковка по умолчанию для всех заказов.
    */
    'discreet_packaging_default' => true,

    /*
    | Юридические реквизиты продавца. Единый источник для футера, legal-страниц,
    | PDF-инвойсов и писем. Задаются в .env (COMPANY_*).
    */
    'company' => [
        'name' => env('COMPANY_NAME', 'VELOUR'),
        'address' => env('COMPANY_ADDRESS', ''),
        'reg_number' => env('COMPANY_REG_NUMBER', ''),
        'email' => env('COMPANY_EMAIL', env('MAIL_FROM_ADDRESS', 'info@velour-retail.com')),
        'phone' => env('COMPANY_PHONE', ''),
        // Номер плательщика НДС — в инвойсах и legal notice; пусто — не показываем.
        'vat_number' => env('COMPANY_VAT_NUMBER', ''),
        // Куда отправлять возвраты. Пусто — сообщаем адрес по запросу после уведомления об отказе.
        'returns_address' => env('COMPANY_RETURNS_ADDRESS', ''),
    ],

    'security' => [
        // Content-Security-Policy в production. Дополнения (платёжный провайдер) — VELOUR_CSP_EXTRA.
        'csp' => (bool) env('VELOUR_CSP', true),
        'csp_extra' => env('VELOUR_CSP_EXTRA', ''),
    ],

    'currency' => env('VELOUR_CURRENCY', 'EUR'),

    /*
    | Пометка у цен. В ЕС потребителю показывают итоговую цену со всеми налогами,
    | поэтому по умолчанию «incl. VAT». Пустая строка — не показывать.
    | Ставку/регистрацию (OSS/IOSS для компании из UK) подтверждает бухгалтер.
    */
    'vat_note' => env('VELOUR_VAT_NOTE', 'incl. VAT'),

    'shipping' => [
        'flat_cents' => (int) env('VELOUR_SHIPPING_FLAT', 590),
        'free_from_cents' => (int) env('VELOUR_SHIPPING_FREE_FROM', 9000),
        // Срок отправки со склада (рабочие дни) — показывается на странице Delivery.
        'dispatch_days' => env('VELOUR_DISPATCH_DAYS', '1–2'),
        /*
        | Регионы доставки: срок в пути и стоимость. Срок показывается на странице
        | Delivery (таблица) и в оформлении заказа для выбранной страны.
        | fee: standard — {flat_cents}, бесплатно от {free_from_cents};
        |      checkout — считается при оформлении; quote — согласуется отдельно.
        */
        'regions' => [
            'uk' => [
                'name' => 'United Kingdom',
                'window' => '7–10 days',
                'details' => 'Most orders are expected to arrive within approximately 7 to 10 days after dispatch.',
                'fee' => 'standard',
            ],
            'eu' => [
                'name' => 'European Union',
                'window' => '15–25 days',
                'details' => 'Deliveries commonly take around 15 to 25 days, depending on the destination, carrier route and customs handling.',
                'fee' => 'standard',
            ],
            'worldwide' => [
                'name' => 'Worldwide',
                'window' => '25–30 days',
                'details' => 'Orders outside the UK and EU generally arrive within approximately 25 to 30 days, subject to customs clearance and local carrier operations.',
                'fee' => 'checkout',
            ],
            'oversized' => [
                'name' => 'Oversized or specialist delivery',
                'window' => null,
                'details' => 'An estimated timeframe is confirmed separately where additional freight or delivery coordination is required.',
                'fee' => 'quote',
            ],
        ],

        /*
        | Страны, доступные в оформлении заказа (В9), по регионам. Добавить страну —
        | одна строка; срок подтянется из региона. Страны «worldwide» добавляй
        | только после решения по таможне и налогам на импорт.
        */
        'countries_by_region' => [
            'uk' => [
                'GB' => 'United Kingdom',
            ],
            'eu' => [
            'AT' => 'Austria',
            'BE' => 'Belgium',
            'BG' => 'Bulgaria',
            'HR' => 'Croatia',
            'CY' => 'Cyprus',
            'CZ' => 'Czechia',
            'DK' => 'Denmark',
            'EE' => 'Estonia',
            'FI' => 'Finland',
            'FR' => 'France',
            'DE' => 'Germany',
            'GR' => 'Greece',
            'HU' => 'Hungary',
            'IE' => 'Ireland',
            'IT' => 'Italy',
            'LV' => 'Latvia',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'MT' => 'Malta',
            'NL' => 'Netherlands',
            'PL' => 'Poland',
            'PT' => 'Portugal',
            'RO' => 'Romania',
            'SK' => 'Slovakia',
            'SI' => 'Slovenia',
            'ES' => 'Spain',
            'SE' => 'Sweden',
            ],
            'worldwide' => [],
        ],
    ],

    'payments' => [
        /*
        | ВАЖНО: Stripe / PayPal / Apple Pay / Google Pay ограничивают или
        | запрещают adult. Реальный запуск — только на high-risk провайдере
        | (CCBill, Segpay, Epoch, Verotel) или прямом договоре с эквайером.
        | До этого работает драйвер manual: заказ оформляется, оплата ожидает.
        */
        'default' => env('VELOUR_PAYMENT_DRIVER', 'manual'),
    ],
];
