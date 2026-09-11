<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';       // создан, ждёт оплаты
    case Paid = 'paid';             // деньги получены
    case Packing = 'packing';       // собирается (анонимная упаковка)
    case Shipped = 'shipped';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Awaiting payment',
            self::Paid => 'Paid',
            self::Packing => 'Packing',
            self::Shipped => 'Shipped',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
        };
    }

    /** Сток уже списан для этих статусов. */
    public function holdsStock(): bool
    {
        return in_array($this, [self::Pending, self::Paid, self::Packing, self::Shipped, self::Completed], true);
    }
}
