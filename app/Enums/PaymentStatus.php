<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Initiated = 'initiated';
    case Pending = 'pending';       // ждём подтверждения провайдера/webhook
    case Succeeded = 'succeeded';
    case Failed = 'failed';
    case Refunded = 'refunded';
}
