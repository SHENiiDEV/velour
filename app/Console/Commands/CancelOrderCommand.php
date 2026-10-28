<?php

namespace App\Console\Commands;

use App\Mail\OrderCancelledMail;
use App\Models\Order;
use App\Services\Orders\OrderCancellation;
use DomainException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Отмена заказа из консоли:
 *   php artisan velour:order-cancel VLR-7K3Q9P
 *   php artisan velour:order-cancel VLR-7K3Q9P --reason="This item is no longer available."
 *   php artisan velour:order-cancel VLR-7K3Q9P --no-email      — тихо, без письма
 *   php artisan velour:order-cancel VLR-7K3Q9P --no-restock    — не возвращать на склад
 *   php artisan velour:order-cancel VLR-7K3Q9P --force         — даже если уже отправлен
 *
 * Причина (--reason) видна клиенту в письме — пиши её для клиента, по-английски.
 * Письмо уходит сразу (не через очередь), чтобы ошибка SMTP была видна здесь же.
 */
class CancelOrderCommand extends Command
{
    protected $signature = 'velour:order-cancel
        {number : номер заказа, например VLR-7K3Q9P}
        {--reason= : причина для клиента (появится в письме)}
        {--no-email : не отправлять письмо клиенту}
        {--no-restock : не возвращать товар на склад}
        {--force : отменить даже отправленный заказ}';

    protected $description = 'Отменить заказ: статус, возврат на склад и письмо клиенту';

    public function handle(OrderCancellation $cancellation): int
    {
        $number = strtoupper(trim($this->argument('number')));
        $order = Order::with('items')->where('number', $number)->first();

        if (! $order) {
            $this->error("Заказ {$number} не найден.");

            return self::FAILURE;
        }

        $this->table(['Заказ', 'Клиент', 'Статус', 'Сумма', 'Создан'], [[
            $order->number,
            ($order->shipping_address['name'] ?? '—').' <'.$order->email.'>',
            $order->status->label(),
            number_format($order->total_cents / 100, 2).' '.$order->currency,
            $order->placed_at?->format('Y-m-d H:i') ?? $order->created_at?->format('Y-m-d H:i'),
        ]]);
        $this->table(['Товар', 'Кол-во', 'Сумма'], $order->items->map(fn ($i) => [
            $i->product_name_snapshot.($i->variant_name_snapshot ? ' · '.$i->variant_name_snapshot : ''),
            $i->qty,
            number_format($i->total_cents / 100, 2),
        ])->all());

        if (! $this->confirm("Отменить заказ {$order->number}?", true)) {
            $this->line('Ничего не изменено.');

            return self::SUCCESS;
        }

        try {
            $result = $cancellation->cancel(
                $order,
                reason: $this->option('reason'),
                restock: ! $this->option('no-restock'),
                force: (bool) $this->option('force'),
            );
        } catch (DomainException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info("Заказ {$order->number} отменён.");
        $this->line($result['restocked'] > 0 ? "На склад возвращено: {$result['restocked']} шт." : 'Склад не менялся.');

        if ($result['wasPaid']) {
            $this->warn('Заказ был оплачен — сделай возврат денег у платёжного провайдера (по закону — не позже 14 дней).');
        }

        if ($this->option('no-email')) {
            $this->line('Письмо клиенту не отправлялось (--no-email).');

            return self::SUCCESS;
        }

        try {
            Mail::to($order->email)->send(new OrderCancelledMail($order->fresh('items'), $result['wasPaid']));
            $this->info("Письмо об отмене отправлено на {$order->email}.");
        } catch (\Throwable $e) {
            report($e);
            $this->error('Заказ отменён, но письмо не ушло: '.$e->getMessage());
            $this->line('Проверь SMTP: php artisan velour:mail-test твой@email');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
