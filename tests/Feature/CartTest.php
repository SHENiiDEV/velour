<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Variant;
use App\Services\CartService;

beforeEach(function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
});

it('lets a guest add an item without registering', function () {
    $variant = Variant::factory()->for(Product::factory())->create();

    $this->from('/cart')
        ->post('/cart', ['variant_id' => $variant->id, 'qty' => 2])
        ->assertRedirect('/cart')
        ->assertCookie(CartService::COOKIE);

    expect(CartItem::count())->toBe(1)
        ->and(CartItem::first()->qty)->toBe(2);
});

it('refuses to add more than the stock allows', function () {
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 1]);

    $this->post('/cart', ['variant_id' => $variant->id, 'qty' => 3])
        ->assertStatus(422);
});

it('snapshots the price at the moment of adding', function () {
    $product = Product::factory()->create(['price_cents' => 5000]);
    $variant = Variant::factory()->for($product)->create();

    $this->post('/cart', ['variant_id' => $variant->id]);
    $product->update(['price_cents' => 9999]);

    expect(CartItem::first()->unit_price_cents)->toBe(5000);
});

it('sums quantities instead of duplicating a line', function () {
    $variant = Variant::factory()->for(Product::factory())->create(['stock' => 5]);

    $this->post('/cart', ['variant_id' => $variant->id, 'qty' => 2]);
    keepCart($this);
    $this->post('/cart', ['variant_id' => $variant->id, 'qty' => 1]);

    expect(CartItem::count())->toBe(1)
        ->and(CartItem::first()->qty)->toBe(3);
});

it("does not let another visitor touch someone else's cart item", function () {
    $variant = Variant::factory()->for(Product::factory())->create();
    $this->post('/cart', ['variant_id' => $variant->id]);

    // Второй посетитель: cookie корзины у него нет — значит, и позиции для него нет.
    $item = CartItem::first();

    $this->delete("/cart/{$item->id}")->assertNotFound();

    expect(CartItem::count())->toBe(1);
});
