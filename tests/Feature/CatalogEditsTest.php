<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Models\Product;
use App\Models\Variant;
use App\Services\Catalog\FeatureDetector;

beforeEach(function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
    FeatureDetector::ensureDefinitions();
});

function product(array $attributes, int $price = 5000, ?string $brand = 'SVAKOM'): Product
{
    return Product::factory()
        ->has(Variant::factory()->state(['price_cents' => $price, 'stock' => 5, 'is_active' => true]))
        ->create(['attributes' => $attributes, 'price_cents' => $price, 'brand' => $brand]);
}

it('shows an edit page with its own intro and preset selection', function () {
    $couples = product(['kind' => 'wearable', 'couples' => true]);
    $app = product(['kind' => 'vibrator', 'app_control' => true]);
    product(['kind' => 'wand']);

    $this->get('/edit/for-two')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('catalog/index')
            ->where('edit.slug', 'for-two')
            ->where('edit.title', 'For two')
            ->has('products.data', 2));

    expect([$couples->id, $app->id])->each->toBeInt();
});

it('returns 404 for an unknown edit', function () {
    $this->get('/edit/nope')->assertNotFound();
});

it('keeps gifts under the price limit and without accessories', function () {
    $gift = product(['kind' => 'wand'], 8900);
    product(['kind' => 'wand'], 15900);
    product(['kind' => 'accessory'], 1500);

    $this->get('/edit/gifts')->assertInertia(fn ($page) => $page
        ->has('products.data', 1)
        ->where('products.data.0.slug', $gift->slug));
});

it('offers type, price, features and brand filters with counts, and applies them', function () {
    product(['kind' => 'wand', 'waterproof' => true], 4500);
    product(['kind' => 'wand'], 8900);
    product(['kind' => 'rabbit', 'waterproof' => true], 12900, 'Kaotik Labs');

    $this->get('/catalog')->assertInertia(fn ($page) => $page
        ->where('filters.0.key', 'kind')
        ->where('filters.0.counts.wand', 2)
        ->where('filters.1.key', 'price')
        ->where('filters.1.counts.under-50', 1)
        ->where('filters.2.key', 'waterproof')
        ->where('filters.2.counts.1', 2)
        ->where('filters.3.key', 'brand'));

    $this->get('/catalog?kind[]=wand&waterproof=1')->assertInertia(fn ($page) => $page->has('products.data', 1));
    $this->get('/catalog?price[]=50-100&price[]=100-200')->assertInertia(fn ($page) => $page->has('products.data', 2));
    $this->get('/catalog?brand[]=Kaotik%20Labs')->assertInertia(fn ($page) => $page->has('products.data', 1));
});

it('shares edits for the header', function () {
    $this->get('/catalog')->assertInertia(fn ($page) => $page->where('navEdits.0.slug', 'new-in'));
});
