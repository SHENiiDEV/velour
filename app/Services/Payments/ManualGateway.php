<?php

namespace App\Services\Payments;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Драйвер по умолчанию до подключения реального провайдера:
 * заказ создаётся, оплата помечается «ожидает» (перевод / оплата при получении).
 * Позволяет пройти весь checkout end-to-end и писать тесты, не имея эквайера.
 */
class ManualGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'manual';
    }

    public function initiate(Order $order): PaymentIntent
    {
        $payment = $order->payments()->create([
            'provider' => $this->name(),
            'status' => PaymentStatus::Pending,
            'amount_cents' => $order->total_cents,
            'currency' => $order->currency,
            'payload' => ['note' => 'Ручное подтверждение оплаты'],
        ]);

        return new PaymentIntent($payment, route('checkout.success', $order));
    }

    public function handleWebhook(Request $request): ?Payment
    {
        return null; // У ручного драйвера webhook'ов нет.
    }
}
