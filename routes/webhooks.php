<?php

use App\Http\Controllers\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

/*
| Webhook'и платёжных провайдеров.
|
| Отдельный файл и отдельная группа маршрутов: здесь НЕТ web-middleware —
| ни сессии, ни CSRF, ни age-gate. Провайдер стучится машиной, а не браузером.
| Подлинность запроса проверяет драйвер по подписи, обработка идемпотентна.
*/
Route::post('/webhooks/payments/{provider}', PaymentWebhookController::class)
    ->name('payments.webhook');
