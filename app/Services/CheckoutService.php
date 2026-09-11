<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Mail\OrderConfirmationMail;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Variant;
use App\Services\Payments\PaymentIntent;
use App\Services\Payments\PaymentManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        protected CartService $carts,
        protected PaymentManager $payments,
    ) {}

    /**
     * Создаёт заказ из корзины: снимки цен и названий, списание стока
     * под блокировкой строк, инициация оплаты и отправка письма с инвойсом.
     *
     * @param  array{email:string, phone?:string|null, shipping_address:array, notes?:string|null, discreet_packaging?:bool}  $data
     */
    public function place(Cart $cart, array $data): PaymentIntent
    {
        $cart->loadMissing('items.variant.product');

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        /** @var Order $order */
        $order = DB::transaction(function () use ($cart, $data) {
            $subtotal = 0;
            $lines = [];

            foreach ($cart->items as $item) {
                /** @var Variant $variant */
                $variant = Variant::query()
                    ->with('product')
                    ->lockForUpdate()          // защищаемся от гонки за последний экземпляр
                    ->find($item->variant_id);

                if (! $variant || ! $variant->isAvailable($item->qty)) {
                    throw ValidationException::withMessages([
                        'cart' => "“{$item->variant?->name}” — there is less in stock than in your cart.",
                    ]);
                }

                $unit = $variant->priceCents();
                $total = $unit * $item->qty;
                $subtotal += $total;

                $lines[] = [
                    'variant_id' => $variant->id,
                    'product_name_snapshot' => $variant->product->name,
                    'variant_name_snapshot' => $variant->name,
                    'sku_snapshot' => $variant->sku,
                    'qty' => $item->qty,
                    'unit_price_cents' => $unit,
                    'total_cents' => $total,
                ];

                $variant->decrement('stock', $item->qty);
            }

            $shipping = $this->shippingCents($subtotal);

            $order = Order::create([
                'user_id' => $cart->user_id,
                'number' => Order::nextNumber(),
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'status' => OrderStatus::Pending,
                'currency' => $cart->currency,
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'total_cents' => $subtotal + $shipping,
                // Приватность по умолчанию включена и выключается только явно.
                'is_discreet_packaging' => $data['discreet_packaging'] ?? config('velour.discreet_packaging_default'),
                'statement_descriptor' => config('velour.statement_descriptor'),
                'shipping_address' => $data['shipping_address'],
                'notes' => $data['notes'] ?? null,
                'placed_at' => now(),
            ]);

            $order->items()->createMany($lines);

            return $order;
        });

        $this->carts->clear($cart);

        // Отправка письма с вложенным темным PDF-инвойсом клиенту
        try {
            Mail::to($order->email)->queue(new OrderConfirmationMail($order));
        } catch (\Throwable $e) {
            report($e);
        }

        return $this->payments->driver()->initiate($order);
    }

    /** Бесплатная доставка от порога — иначе фиксированная ставка. */
    protected function shippingCents(int $subtotalCents): int
    {
        $threshold = (int) config('velour.shipping.free_from_cents');

        return $subtotalCents >= $threshold ? 0 : (int) config('velour.shipping.flat_cents');
    }
}
