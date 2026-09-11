<?php

return [
    /*
    | Куда уводим при «быстром выходе» и при отказе на age-gate.
    | Нейтральный сайт без следов в истории (фронт делает location.replace).
    */
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
