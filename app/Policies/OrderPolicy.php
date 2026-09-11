<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /** Заказ виден владельцу или админу. Гостю — по подписанной ссылке (см. контроллер). */
    public function view(User $user, Order $order): bool
    {
        return $user->is_admin || $order->user_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->is_admin;
    }
}
