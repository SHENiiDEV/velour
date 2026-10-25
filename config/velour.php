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
        | Страны доставки: ISO-код => [название, срок в пути]. Только они доступны
        | в оформлении заказа (В9). Меняется здесь — меняется везде.
        */
        'countries' => [
            'LV' => ['name' => 'Latvia', 'transit' => '1–2 business days'],
            'LT' => ['name' => 'Lithuania', 'transit' => '2–3 business days'],
            'EE' => ['name' => 'Estonia', 'transit' => '2–3 business days'],
            'FI' => ['name' => 'Finland', 'transit' => '3–5 business days'],
            'PL' => ['name' => 'Poland', 'transit' => '3–5 business days'],
            'DE' => ['name' => 'Germany', 'transit' => '3–5 business days'],
            'FR' => ['name' => 'France', 'transit' => '4–6 business days'],
            'NL' => ['name' => 'Netherlands', 'transit' => '3–5 business days'],
            'SE' => ['name' => 'Sweden', 'transit' => '3–5 business days'],
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
