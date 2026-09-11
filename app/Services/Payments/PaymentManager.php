<?php

namespace App\Services\Payments;

use InvalidArgumentException;

/** Резолвер драйверов: config('velour.payments.default'). */
class PaymentManager
{
    /** @var array<string, class-string<PaymentGateway>> */
    protected array $drivers = [
        'manual' => ManualGateway::class,
        // 'ccbill' => CcbillGateway::class,
        // 'segpay' => SegpayGateway::class,
    ];

    public function driver(?string $name = null): PaymentGateway
    {
        $name ??= config('velour.payments.default', 'manual');

        if (! isset($this->drivers[$name])) {
            throw new InvalidArgumentException("Платёжный драйвер [{$name}] не зарегистрирован.");
        }

        return app($this->drivers[$name]);
    }

    /** @param  class-string<PaymentGateway>  $class */
    public function extend(string $name, string $class): void
    {
        $this->drivers[$name] = $class;
    }
}
