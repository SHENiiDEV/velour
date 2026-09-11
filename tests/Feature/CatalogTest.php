<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Models\AttributeDefinition;
use App\Models\Product;
use App\Models\Variant;

beforeEach(function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
});

it('lists live products', function () {
    $live = Product::factory()->has(Variant::factory())->create();
    $draft = Product::factory()->draft()->create();

    $this->get('/catalog')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('catalog/index')
            ->has('products.data', 1)
            ->where('products.data.0.slug', $live->slug)
        );

    expect($draft->status->value)->toBe('draft');
});

it('hides draft products from guests but shows them to admins', function () {
    $draft = Product::factory()->draft()->has(Variant::factory())->create();

    $this->get("/p/{$draft->slug}")->assertForbidden();

    $admin = \App\Models\User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->get("/p/{$draft->slug}")->assertOk();
});

it('indexes json attributes into the flat table for filtering', function () {
    $product = Product::factory()->has(Variant::factory())->create([
        'attributes' => ['firmness' => 5, 'texture' => 'polished'],
    ]);

    expect($product->attributeValues()->count())->toBe(2)
        ->and($product->attributeValues()->where('key', 'firmness')->value('value_numeric'))->toEqual(5.0);

    Product::factory()->has(Variant::factory())->create(['attributes' => ['firmness' => 1]]);

    expect(Product::query()->withAttribute('firmness', 5)->count())->toBe(1);
});

it('exposes human labels for sensory scales on the product page', function () {
    AttributeDefinition::create([
        'key' => 'firmness',
        'label' => 'Firmness',
        'type' => 'scale',
        'scale' => ['min' => 1, 'max' => 5, 'labels' => ['5' => 'hard']],
    ]);

    $product = Product::factory()->has(Variant::factory())->create(['attributes' => ['firmness' => 5]]);

    $this->get("/p/{$product->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('product/show')
            ->where('product.sensory.0.label', 'Firmness')
            ->where('product.sensory.0.valueLabel', 'hard')
        );
});
