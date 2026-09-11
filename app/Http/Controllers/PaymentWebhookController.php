<?php

namespace App\Http\Controllers;

use App\Services\Payments\PaymentManager;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Webhook провайдера. Маршрут ВНЕ группы web (без CSRF, без age-gate) —
 * см. routes/web.php. Проверка подписи — обязанность драйвера.
 */
class PaymentWebhookController extends Controller
{
    public function __invoke(Request $request, string $provider, PaymentManager $payments): Response
    {
        $payments->driver($provider)->handleWebhook($request);

        // Всегда 200: провайдеры ретраят на любой другой код, а обработка идемпотентна.
        return response('ok');
    }
}
