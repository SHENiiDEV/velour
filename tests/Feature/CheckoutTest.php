<?php

use App\Enums\OrderStatus;
use App\Http\Middleware\EnsureAgeVerified;
use App\Mail\OrderConfirmationMail;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
});

/** Кладём товар в корзину и оформляем заказ от лица гостя. */
function placeOrder($test, array $overrides = []): array
{
    $product = Product::factory()->create(['price_cents' => 5000]);
    $variant = Variant::factory()->for($product)->create(['stock' => 3]);

    $test->post('/cart', ['variant_id' => $variant->id, 'qty' => 2]);
    keepCart($test);

    $response = $test->post('/checkout', array_merge([
        'email' => 'guest@example.com',
        'shipping_address' => [
            'name' => 'Guest',
            'line1' => 'Brīvības 1',
            'city' => 'Rīga',
            'postcode' => 'LV-1010',
            'country' => 'LV',
        ],
        'age_confirmed' => true,
        'terms_accepted' => true,
    ], $overrides));

    return [$variant, $response];
}

it('creates an order from the cart and decrements stock', function () {
    [$variant, $response] = placeOrder($this);

    $order = Order::first();

    expect($order)->not->toBeNull()
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->subtotal_cents)->toBe(10000)
        ->and($order->items)->toHaveCount(1)
        ->and($variant->fresh()->stock)->toBe(1);

    $response->assertRedirect(route('checkout.success', $order));
});

it('defaults to discreet packaging and a neutral statement descriptor', function () {
    placeOrder($this);

    $order = Order::first();

    expect($order->is_discreet_packaging)->toBeTrue()
        ->and($order->statement_descriptor)->toBe(config('velour.statement_descriptor'));
});

it('keeps snapshots so a renamed product does not rewrite past orders', function () {
    [$variant] = placeOrder($this);

    $original = $variant->product->name;
    $variant->product->update(['name' => 'A different name']);

    expect(Order::first()->items->first()->product_name_snapshot)->toBe($original);
});

it('opens a pending payment through the configured driver', function () {
    placeOrder($this);

    $payment = Order::first()->payments()->first();

    expect($payment->provider)->toBe(config('velour.payments.default'))
        ->and($payment->amount_cents)->toBe(Order::first()->total_cents);
});

it('requires the age and terms confirmations', function () {
    [, $response] = placeOrder($this, ['age_confirmed' => false]);

    $response->assertSessionHasErrors('age_confirmed');

    expect(Order::count())->toBe(0);
});

it('does not sell more than is in stock', function () {
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 1]);

    $this->post('/cart', ['variant_id' => $variant->id, 'qty' => 1]);
    keepCart($this);

    // Кто-то успел раньше.
    $variant->update(['stock' => 0]);

    $this->post('/checkout', [
        'email' => 'guest@example.com',
        'shipping_address' => ['name' => 'G', 'line1' => 'X', 'city' => 'Rīga', 'postcode' => '1010', 'country' => 'LV'],
        'age_confirmed' => true,
        'terms_accepted' => true,
    ])->assertSessionHasErrors('cart');

    expect(Order::count())->toBe(0);
});

it('empties the cart after a successful order', function () {
    placeOrder($this);

    expect(CartItem::count())->toBe(0);
});

it('shows the success page to the guest who just ordered', function () {
    placeOrder($this);

    $this->get(route('checkout.success', Order::first()))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('checkout/success'));
});

it('hides the success page from an unrelated visitor', function () {
    placeOrder($this);
    $order = Order::first();

    $this->flushSession();

    $this->get(route('checkout.success', $order))->assertNotFound();
});

it('queues an order confirmation email upon checkout', function () {
    Mail::fake();

    placeOrder($this);

    $order = Order::first();

    Mail::assertQueued(OrderConfirmationMail::class, function ($mail) use ($order) {
        return $mail->hasTo('guest@example.com') && $mail->order->is($order);
    });
});

it('allows the customer to download their dark PDF invoice', function () {
    placeOrder($this);
    $order = Order::first();

    $response = $this->get(route('order.invoice', $order));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});
