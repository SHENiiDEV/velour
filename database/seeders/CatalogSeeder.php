<?php

namespace Database\Seeders;

use App\Enums\MediaKind;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Демо-каталог. Копирайт — тактильный и взрослый: материал, вес, свет.
 * Изображений в репозитории нет — плейсхолдеры одноцветные, чтобы фронт
 * можно было верстать до фотосъёмки.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'toys', 'name' => 'Toys', 'tagline' => 'Shape, weight, temperature', 'position' => 10],
            ['slug' => 'play', 'name' => 'Play', 'tagline' => 'Cuffs, rope, and the pause before', 'position' => 20],
            ['slug' => 'costume', 'name' => 'Costume', 'tagline' => 'Latex, lace, someone else for an hour', 'position' => 30],
            ['slug' => 'rituals', 'name' => 'Rituals', 'tagline' => 'Oils, candles, aftercare', 'position' => 40],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $products = [
            [
                'category' => 'toys',
                'name' => 'Onyx',
                'tagline' => 'Glass that remembers the cold for longer',
                'story' => 'Borosilicate is cast by hand: every piece differs a little in weight and in how it settles into the palm. It holds temperature — run it under cold water or warm it in your hand, whichever you prefer.',
                'description' => "Polished borosilicate glass.\n\nA non-porous surface is the easiest thing to care for that we know of.",
                'care' => 'Warm water and soap, or the dishwasher. Compatible with any lubricant, silicone included.',
                'materials' => ['Borosilicate glass'],
                'attributes' => ['firmness' => 5, 'texture' => 'polished', 'weight' => 4, 'noise' => 1, 'temperature' => 'holds-cool', 'waterproof' => true, 'lube_safe' => true],
                'price_cents' => 8900,
                'is_featured' => true,
                'variants' => [
                    ['name' => 'Clear', 'options' => ['color' => 'clear'], 'stock' => 12, 'is_default' => true],
                    ['name' => 'Smoke', 'options' => ['color' => 'smoke'], 'stock' => 7, 'price_cents' => 9400],
                ],
                'color' => '231A1F',
            ],
            [
                'category' => 'toys',
                'name' => 'Velvet',
                'tagline' => 'Matte silicone, warm almost at once',
                'story' => 'A soft surface without the silicone squeak. It warms in a minute and holds the heat of your body until you set it down.',
                'description' => 'Medical-grade silicone, cast in one piece — no seams or joins where anything could gather.',
                'care' => 'Warm water and soap. Water-based lubricant only: silicone lube softens silicone.',
                'materials' => ['Medical-grade silicone (platinum-cure)'],
                'attributes' => ['firmness' => 2, 'texture' => 'silk', 'weight' => 2, 'noise' => 1, 'temperature' => 'body-warm', 'waterproof' => true, 'lube_safe' => false],
                'price_cents' => 6400,
                'variants' => [
                    ['name' => 'Bordeaux', 'options' => ['color' => 'wine'], 'stock' => 18, 'is_default' => true],
                    ['name' => 'Ash', 'options' => ['color' => 'ash'], 'stock' => 0],
                ],
                'color' => '4E1224',
            ],
            [
                'category' => 'toys',
                'name' => 'Ballast',
                'tagline' => 'Weight you feel in your palm',
                'story' => 'Polished stainless steel: heavy, cool, honest. The kind of object you want to leave out in plain sight.',
                'description' => 'Stainless steel 316L, polished by hand.',
                'care' => 'Boiling is fine. Compatible with any lubricant.',
                'materials' => ['Stainless steel 316L'],
                'attributes' => ['firmness' => 5, 'texture' => 'polished', 'weight' => 5, 'noise' => 1, 'temperature' => 'holds-cool', 'waterproof' => true, 'lube_safe' => true],
                'price_cents' => 14900,
                'is_featured' => true,
                'variants' => [
                    ['name' => 'Steel', 'options' => ['finish' => 'steel'], 'stock' => 5, 'is_default' => true],
                ],
                'color' => '9E8E88',
            ],
            [
                'category' => 'play',
                'name' => 'Tether',
                'tagline' => 'Cuffs that hold without biting',
                'story' => 'Vegetable-tanned leather softens to the wrist within a week and keeps the shape after. The steel is solid, not plated — it will outlast the leather.',
                'description' => "A pair of wrist cuffs with a detachable steel connector.\n\nQuick-release on both sides: one hand is always enough to undo them.",
                'care' => 'Wipe with a damp cloth, dry away from heat, condition twice a year. Never soak.',
                'materials' => ['Vegetable-tanned leather', 'Stainless steel 316L'],
                'attributes' => ['firmness' => 3, 'texture' => 'matte', 'weight' => 3, 'noise' => 2, 'temperature' => 'body-warm', 'waterproof' => false],
                'price_cents' => 11900,
                'variants' => [
                    ['name' => 'Black', 'options' => ['color' => 'void'], 'stock' => 14, 'is_default' => true],
                    ['name' => 'Oxblood', 'options' => ['color' => 'wine'], 'stock' => 6],
                ],
                'color' => '1A1216',
            ],
            [
                'category' => 'costume',
                'name' => 'Second Skin',
                'tagline' => 'Latex gloves, wrist to elbow',
                'story' => 'Sheet latex, glued by hand and finished with chlorination so it slides on without powder and keeps its shine without polish.',
                'description' => "0.4 mm natural latex, seamed along the inner arm.\n\nContains latex — not suitable if you have an allergy.",
                'care' => 'Rinse in cool water, dry flat away from light, dust lightly before storing. Water-based lubricant only: oil destroys latex.',
                'materials' => ['Natural latex, 0.4 mm'],
                'attributes' => ['firmness' => 2, 'texture' => 'polished', 'weight' => 1, 'noise' => 2, 'temperature' => 'body-warm', 'waterproof' => true, 'lube_safe' => false],
                'price_cents' => 7900,
                'is_featured' => true,
                'variants' => [
                    ['name' => 'S / M', 'options' => ['size' => 'sm'], 'stock' => 9, 'is_default' => true],
                    ['name' => 'L / XL', 'options' => ['size' => 'lxl'], 'stock' => 4],
                ],
                'color' => '3A0F1B',
            ],
            [
                'category' => 'rituals',
                'name' => 'Hour',
                'tagline' => 'A candle that becomes oil',
                'story' => 'Soy wax melts a little above body temperature: put out the wick and pour it into your hands. It burns for about four hours.',
                'description' => 'Soy wax, jojoba oil, fig and cedar.',
                'care' => 'Trim the wick to 5 mm. Never leave it unattended.',
                'materials' => ['Soy wax', 'Jojoba oil'],
                'attributes' => ['texture' => 'matte', 'weight' => 3, 'noise' => 1, 'temperature' => 'body-warm', 'waterproof' => false],
                'price_cents' => 3400,
                'variants' => [
                    ['name' => '180 ml', 'options' => ['volume' => '180ml'], 'stock' => 30, 'is_default' => true],
                ],
                'color' => 'C6A15B',
            ],
            [
                'category' => 'rituals',
                'name' => 'Water',
                'tagline' => 'Water-based lubricant, glycerine-free',
                'story' => 'Neutral pH, no scent and no taste. Compatible with everything — silicone, glass, latex.',
                'description' => 'Water, hydroxyethylcellulose. No glycerine, parabens or fragrance.',
                'care' => 'Store at room temperature. Use within 6 months of opening.',
                'materials' => ['Water base, glycerine-free'],
                'attributes' => ['texture' => 'silk', 'noise' => 1, 'temperature' => 'neutral', 'waterproof' => false, 'lube_safe' => true],
                'price_cents' => 1900,
                'variants' => [
                    ['name' => '100 ml', 'options' => ['volume' => '100ml'], 'stock' => 40, 'is_default' => true],
                    ['name' => '250 ml', 'options' => ['volume' => '250ml'], 'stock' => 22, 'price_cents' => 3200],
                ],
                'color' => 'ECE3D6',
            ],
        ];

        foreach ($products as $index => $data) {
            $category = Category::firstWhere('slug', $data['category']);

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'category_id' => $category->id,
                    'name' => $data['name'],
                    'tagline' => $data['tagline'],
                    'description' => $data['description'],
                    'story' => $data['story'],
                    'care' => $data['care'],
                    'materials' => $data['materials'],
                    'attributes' => $data['attributes'],
                    'price_cents' => $data['price_cents'],
                    'currency' => config('velour.currency'),
                    'status' => ProductStatus::Live,
                    'is_body_safe' => true,
                    'is_featured' => $data['is_featured'] ?? false,
                    'published_at' => now()->subDays($index),
                ],
            );

            foreach ($data['variants'] as $position => $variant) {
                Variant::updateOrCreate(
                    ['sku' => strtoupper(Str::slug($data['name'])).'-'.($position + 1)],
                    [
                        'product_id' => $product->id,
                        'name' => $variant['name'],
                        'options' => $variant['options'],
                        'price_cents' => $variant['price_cents'] ?? null,
                        'stock' => $variant['stock'],
                        'is_default' => $variant['is_default'] ?? false,
                    ],
                );
            }

            // Плейсхолдеры до съёмки: абстрактный цвет — его не стыдно показать
            // и в скрытном режиме, поэтому discreet_safe = true.
            if ($product->media()->count() === 0) {
                $product->media()->create([
                    'path' => "https://placehold.co/1200x1500/{$data['color']}/ECE3D6/png?text=".rawurlencode($data['name']),
                    'alt' => "{$data['name']} — {$data['tagline']}",
                    'kind' => MediaKind::Image,
                    'is_discreet_safe' => true,
                    'position' => 0,
                    'meta' => ['w' => 1200, 'h' => 1500],
                ]);
            }
        }
    }
}
