<?php

use App\Enums\OrderStatus;
use App\Mail\OrderCancelledMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Support\Facades\Mail;

function makeOrder(Variant $variant, int $qty = 2, OrderStatus $status = OrderStatus::Pending): Order
{
    $order = Order::create([
        'number' => Order::nextNumber(),
        'email' => 'guest@example.com',
        'status' => $status,
        'currency' => 'EUR',
        'subtotal_cents' => 5000 * $qty,
        'shipping_cents' => 590,
        'total_cents' => 5000 * $qty + 590,
        'shipping_address' => ['name' => 'Ada Lovelace', 'line1' => 'Brīvības 1', 'city' => 'Rīga', 'postcode' => 'LV-1010', 'country' => 'LV'],
        'placed_at' => now(),
    ]);

    $order->items()->create([
        'variant_id' => $variant->id,
        'product_name_snapshot' => 'NOVA',
        'variant_name_snapshot' => 'Plum Red',
        'sku_snapshot' => 'SKU-1',
        'qty' => $qty,
        'unit_price_cents' => 5000,
        'total_cents' => 5000 * $qty,
    ]);

    return $order;
}

it('cancels an order, restocks it and emails the customer', function () {
    Mail::fake();
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 1]);
    $order = makeOrder($variant, 2);

    $this->artisan('velour:order-cancel', ['number' => strtolower($order->number), '--reason' => 'This piece is no longer available.'])
        ->expectsConfirmation("Отменить заказ {$order->number}?", 'yes')
        ->assertSuccessful();

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::Cancelled)
        ->and($order->cancelled_at)->not->toBeNull()
        ->and($order->cancellation_reason)->toBe('This piece is no longer available.')
        ->and($variant->fresh()->stock)->toBe(3);

    Mail::assertSent(OrderCancelledMail::class, fn ($mail) => $mail->hasTo('guest@example.com') && ! $mail->wasPaid);
});

it('does not cancel or restock twice', function () {
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 0]);
    $order = makeOrder($variant, 1, OrderStatus::Cancelled);

    $this->artisan('velour:order-cancel', ['number' => $order->number, '--no-email' => true])
        ->expectsConfirmation("Отменить заказ {$order->number}?", 'yes')
        ->assertFailed();

    expect($variant->fresh()->stock)->toBe(0);
});

it('refuses shipped orders unless forced', function () {
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 0]);
    $order = makeOrder($variant, 1, OrderStatus::Shipped);

    $this->artisan('velour:order-cancel', ['number' => $order->number, '--no-email' => true])
        ->expectsConfirmation("Отменить заказ {$order->number}?", 'yes')
        ->assertFailed();

    expect($order->fresh()->status)->toBe(OrderStatus::Shipped);
});

it('renders the cancellation email with the refund line for paid orders', function () {
    $variant = Variant::factory()->for(Product::factory())->create();
    $order = makeOrder($variant, 1, OrderStatus::Paid);

    $html = (new OrderCancelledMail($order, wasPaid: true))->render();

    expect($html)->toContain($order->number)->toContain('Ada')->toContain('refunding')->toContain('NOVA');
});
