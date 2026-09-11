<?php

namespace App\Services\Payments;

use App\Models\Payment;

/** Результат инициации оплаты: куда вести покупателя. */
readonly class PaymentIntent
{
    public function __construct(
        public Payment $payment,
        /** URL hosted payment page или внутренний маршрут подтверждения. */
        public string $redirectUrl,
    ) {}
}
