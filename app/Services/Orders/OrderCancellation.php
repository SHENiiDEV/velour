<?php

namespace App\Services\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Variant;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Отмена заказа: статус, возврат товара на склад, отметка времени и причины.
 * Всё в одной транзакции с блокировкой строки заказа — двойная отмена
 * не вернёт товар на склад дважды.
 */
class OrderCancellation
{
    /**
     * @return array{restocked:int, wasPaid:bool}
     *
     * @throws DomainException если заказ уже отменён или уже отправлен (без $force)
     */
    public function cancel(Order $order, ?string $reason = null, bool $restock = true, bool $force = false): array
    {
        return DB::transaction(function () use ($order, $reason, $restock, $force) {
            /** @var Order $locked */
            $locked = Order::query()->whereKey($order->getKey())->lockForUpdate()->firstOrFail();

            if (in_array($locked->status, [OrderStatus::Cancelled, OrderStatus::Refunded], true)) {
                throw new DomainException("Order {$locked->number} is already {$locked->status->value}.");
            }

            if (! $force && in_array($locked->status, [OrderStatus::Shipped, OrderStatus::Completed], true)) {
                throw new DomainException("Order {$locked->number} has already been {$locked->status->value}. Handle it as a return, or use --force.");
            }

            $wasPaid = $locked->paid_at !== null || in_array($locked->status, [OrderStatus::Paid, OrderStatus::Packing], true);
            $restocked = 0;

            // Склад возвращаем, только если этот статус его держал (см. OrderStatus::holdsStock).
            if ($restock && $locked->status->holdsStock()) {
                foreach ($locked->items()->get() as $item) {
                    if ($item->variant_id === null) {
                        continue;
                    }
                    Variant::whereKey($item->variant_id)->increment('stock', $item->qty);
                    $restocked += $item->qty;
                }
            }

            $locked->forceFill([
                'status' => OrderStatus::Cancelled,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason !== null && trim($reason) !== '' ? trim($reason) : null,
            ])->save();

            $order->setRawAttributes($locked->getAttributes(), true);

            return ['restocked' => $restocked, 'wasPaid' => $wasPaid];
        });
    }
}
