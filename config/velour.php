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
    ],

    'currency' => env('VELOUR_CURRENCY', 'EUR'),

    'shipping' => [
        'flat_cents' => (int) env('VELOUR_SHIPPING_FLAT', 590),
        'free_from_cents' => (int) env('VELOUR_SHIPPING_FREE_FROM', 9000),
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
