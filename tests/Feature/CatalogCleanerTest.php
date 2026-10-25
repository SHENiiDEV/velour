<?php

use App\Enums\MediaKind;
use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\Variant;
use App\Services\Catalog\CatalogCleaner;

it('cleans an imported card: brand, name, materials, texts, sensory data, discreet flags', function () {
    $product = Product::factory()->create([
        'name' => 'SVAKOM Elmer',
        'tagline' => 'Elmer has a SVAKOM Intelligent Mode which highly imitates the vibration frequency in the w',
        'description' => '<p data-start="1">Elmer is made of soft silicone and plays to your hearts content. <a href="https://www.svakom.com/x">Buy</a></p>'
            .'<h3>Frequently Asked Questions</h3><p>What is SVAKOM Elmer?</p>',
        'story' => 'Crafted from velvety Medical-Grade Silicone and ABS Polymer. Designed with quiet sophistication.',
        'materials' => ['Medical-Grade Silicone', 'ABS Polymer (Phthalate-free)'],
        'is_body_safe' => true,
        'attributes' => ['firmness' => 3, 'noise' => 1],
    ]);
    Variant::factory()->for($product)->create(['name' => 'Default Title']);
    $product->media()->create(['disk' => 'public', 'path' => 'media/x.webp', 'kind' => MediaKind::Image, 'is_discreet_safe' => true, 'position' => 0]);

    app(CatalogCleaner::class)->clean($product->fresh('media'));
    $product->refresh();

    expect($product->name)->toBe('ELMER')
        ->and($product->brand)->toBe('SVAKOM')
        ->and($product->description)->not->toContain('svakom.com')->not->toContain('Frequently Asked')->toContain("heart's content")
        ->and($product->tagline)->toBe("Elmer is made of soft silicone and plays to your heart's content.")
        ->and($product->story)->toBeNull()
        ->and($product->materials)->toBe(['Silicone'])
        ->and($product->is_body_safe)->toBeFalse()
        ->and($product->sensory())->toBe([])
        ->and($product->attributeValues()->count())->toBe(0)
        ->and($product->variants()->first()->name)->toBe('Standard')
        ->and($product->media()->first()->is_discreet_safe)->toBeFalse();
});

it('takes merchandise and the engraving service off the shelf', function () {
    $cap = Product::factory()->create(['name' => 'SVAKOM CAP']);
    $engraving = Product::factory()->create(['name' => 'ENGRAVING SERVICE']);
    $toy = Product::factory()->create(['name' => 'SVAKOM ELMER']);

    app(CatalogCleaner::class)->run();

    expect($cap->fresh()->status)->toBe(ProductStatus::Draft)
        ->and($engraving->fresh()->status)->toBe(ProductStatus::Draft)
        ->and($toy->fresh()->status)->toBe(ProductStatus::Live);
});

it('is idempotent', function () {
    $product = Product::factory()->create(['name' => 'SVAKOM Pulse', 'description' => '<p>Pulse is a gentle silicone wand with ten settings.</p>']);
    $cleaner = app(CatalogCleaner::class);

    $cleaner->clean($product->fresh('media'));
    $first = $product->fresh()->only(['name', 'tagline', 'description', 'materials']);
    $cleaner->clean($product->fresh('media'));

    expect($product->fresh()->only(['name', 'tagline', 'description', 'materials']))->toBe($first);
});

it('splits a heading glued to the first sentence with a full stop', function () {
    $product = Product::factory()->create([
        'name' => 'KLITTY',
        // Старый импорт: заголовок + фраза через перенос, обрезано на 90-м символе.
        'tagline' => "Meet The Cat With A Curious Tongue\n\nNot every toy needs to look like a t",
        'description' => '<p>Not every toy needs to look like a toy. Klitty hides a curious tongue inside a playful shape.</p>',
    ]);

    app(CatalogCleaner::class)->clean($product->fresh('media'));

    expect($product->fresh()->tagline)->toBe('Meet The Cat With A Curious Tongue. Not every toy needs to look like a toy.');
});

it('rewrites the machine-translated ELMER copy, including a tagline it clipped earlier', function () {
    $product = Product::factory()->create([
        'name' => 'ELMER',
        'tagline' => 'Elmer has an Intelligent Mode which highly imitates the vibration frequency in the whole process of sex from the…',
        'description' => '<p>Elmer has a SVAKOM Intelligent Mode which highly imitates the vibration frequency in the whole process of sex from the beginning to orgasm. Single-click the S button, you can start a wonderful sex journey.</p>',
    ]);

    app(CatalogCleaner::class)->clean($product->fresh('media'));
    $product->refresh();

    expect($product->description)->not->toContain('highly imitates')->not->toContain('sex journey')
        ->and($product->tagline)->toBe('Elmer has an Intelligent Mode that follows the natural rise of arousal, from the first slow build to the peak.');
});
