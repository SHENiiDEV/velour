<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Абстракция платежей.
 *
 * Осознанно: Stripe, PayPal, Apple Pay / Google Pay в большинстве юрисдикций
 * запрещают adult-вертикаль. Нужен high-risk провайдер (CCBill, Segpay, Epoch,
 * Verotel) или прямой договор с эквайером. Меняться провайдер будет не раз —
 * поэтому весь код магазина знает только этот интерфейс.
 */
interface PaymentGateway
{
    public function name(): string;

    /**
     * Инициировать оплату. Возвращает объект с URL редиректа
     * (у high-risk провайдеров почти всегда hosted payment page).
     */
    public function initiate(Order $order): PaymentIntent;

    /**
     * Обработать webhook. Реализация ОБЯЗАНА проверить подпись и быть
     * идемпотентной: провайдер шлёт один и тот же callback повторно.
     */
    public function handleWebhook(Request $request): ?Payment;
}
