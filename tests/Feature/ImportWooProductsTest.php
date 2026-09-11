<?php

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Variant;
use App\Support\Woo\WooCsvParser;

/** Небольшая выгрузка того же формата, что присылает Woo. */
function wooFixture(): string
{
    $header = 'ID,Type,SKU,"GTIN, UPC, EAN, or ISBN",Name,Published,"Is featured?","Visibility in catalog","Short description",Description,"In stock?",Stock,"Weight (kg)","Regular price","Sale price",Categories,Images,"Attribute 1 name","Attribute 1 value(s)","Attribute 2 name","Attribute 2 value(s)"';

    $rows = [
        '4983,simple,A451-19236,,"JO Massage Glide Lavender 4oz",1,0,visible,,"<p>Lavender scented glide.</p><p>Dries to a matte finish.</p>",1,89,0.3,54.99,,Lube,https://example.test/a.jpg,UPC,796494400241,brand,"System JO"',
        '4984,simple,A451-19437,,"Ram Extension",1,1,visible,,"<p>Second item.</p>",0,0,0.48,27.99,19.99,"Latex > Rechargable > Kits",https://example.test/b.jpg,MPN,40024,brand,Doc',
        '4985,simple,A451-19999,,"No Category Item",1,0,visible,,"<p>Third.</p>",1,5,,10,,Uncategorized,https://example.test/c.jpg,,,,',
        '4986,variable,A451-20000,,"Variable Parent",1,0,visible,,"<p>Skip me.</p>",1,5,,10,,Lube,https://example.test/d.jpg,,,,',
    ];

    $path = tempnam(sys_get_temp_dir(), 'woo').'.csv';
    file_put_contents($path, "\xEF\xBB\xBF".$header."\n".implode("\n", $rows)."\n");

    return $path;
}

it('parses a woo export into normalised products', function () {
    $parser = new WooCsvParser();
    $items = iterator_to_array($parser->parse(wooFixture()));

    expect($items)->toHaveCount(3)
        ->and($parser->skipped)->toHaveCount(1);

    $first = $items[0];

    expect($first->sourceId)->toBe('4983')
        ->and($first->priceCents)->toBe(5499)
        ->and($first->stock)->toBe(89)
        ->and($first->weightG)->toBe(300)
        ->and($first->brand)->toBe('System JO')
        ->and($first->gtin)->toBe('796494400241')
        ->and($first->categoryPath)->toBe(['Lube'])
        // HTML описания превращается в текст с абзацами.
        ->and($first->description)->toBe("Lavender scented glide.\n\nDries to a matte finish.")
        ->and($first->tagline)->toBe('Lavender scented glide.');
});

it('prefers the sale price and drops junk categories', function () {
    $items = iterator_to_array((new WooCsvParser())->parse(wooFixture()));

    expect($items[1]->priceCents)->toBe(1999)
        ->and($items[1]->stock)->toBe(0)
        ->and($items[1]->categoryPath)->toBe(['Latex', 'Rechargable', 'Kits'])
        ->and($items[2]->categoryPath)->toBe([]);
});

it('imports products, variants, media and the category tree', function () {
    $this->artisan('velour:import-woo', ['file' => wooFixture(), '--currency' => 'GBP'])
        ->assertSuccessful();

    expect(Product::count())->toBe(3)
        ->and(Variant::count())->toBe(3);

    $product = Product::firstWhere('source_id', '4983');

    expect($product->name)->toBe('JO Massage Glide Lavender 4oz')
        ->and($product->currency)->toBe('GBP')
        ->and($product->status)->toBe(ProductStatus::Live)
        ->and($product->brand)->toBe('System JO')
        ->and($product->category->name)->toBe('Lube')
        ->and($product->media)->toHaveCount(1)
        // Предметные кадры производителя размываются в скрытном режиме.
        ->and($product->media->first()->is_discreet_safe)->toBeFalse()
        ->and($product->variants->first()->stock)->toBe(89);

    // Вложенность категорий сохраняется.
    $kits = Category::firstWhere('name', 'Kits');
    expect($kits->parent->name)->toBe('Rechargable')
        ->and($kits->parent->parent->name)->toBe('Latex');

    // Товар без категории уезжает в запасную.
    expect(Product::firstWhere('source_id', '4985')->category->name)->toBe('Other');
});

it('updates instead of duplicating on a second run', function () {
    $file = wooFixture();

    $this->artisan('velour:import-woo', ['file' => $file])->assertSuccessful();
    $this->artisan('velour:import-woo', ['file' => $file])->assertSuccessful();

    expect(Product::count())->toBe(3)
        ->and(Variant::count())->toBe(3)
        ->and(Product::firstWhere('source_id', '4983')->media)->toHaveCount(1);
});

it('adopts a product that was imported before source_id existed', function () {
    // Каталог, наполненный вручную: тот же артикул, но без source.
    $category = Category::create(['slug' => 'lube', 'name' => 'Lube']);
    $legacy = Product::factory()->create(['name' => 'Old name', 'category_id' => $category->id, 'price_cents' => 1]);
    Variant::factory()->for($legacy)->create(['sku' => 'A451-19236']);

    $this->artisan('velour:import-woo', ['file' => wooFixture()])->assertSuccessful();

    // Товар обновлён, а не продублирован.
    expect(Product::count())->toBe(3)
        ->and($legacy->fresh()->name)->toBe('JO Massage Glide Lavender 4oz')
        ->and($legacy->fresh()->source_id)->toBe('4983');
});

it('changes nothing on a dry run', function () {
    $this->artisan('velour:import-woo', ['file' => wooFixture(), '--dry-run' => true])
        ->assertSuccessful();

    expect(Product::count())->toBe(0);
});

it('can park the import in drafts', function () {
    $this->artisan('velour:import-woo', ['file' => wooFixture(), '--draft' => true])->assertSuccessful();

    expect(Product::firstWhere('source_id', '4983')->status)->toBe(ProductStatus::Draft)
        // Черновики не попадают в витрину.
        ->and(Product::query()->live()->count())->toBe(0);
});
