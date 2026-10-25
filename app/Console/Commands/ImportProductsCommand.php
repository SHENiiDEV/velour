<?php

namespace App\Console\Commands;

use App\Enums\MediaKind;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Variant;
use App\Services\Catalog\CatalogCleaner;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportProductsCommand extends Command
{
    protected $signature = 'catalog:import 
                            {file=database/data/svakom_catalog.json}
                            {--fresh : Clear the existing catalog before importing}';

    protected $description = 'Import products from Svakom catalog JSON or CSV';

    public function handle(): int
    {
        if ($this->option('fresh')) {
            $this->call('catalog:clear', ['--force' => true]);
        }

        $file = base_path($this->argument('file'));
        if (!file_exists($file)) {
            // fallback to csv if json not found
            $csvFile = base_path('database/data/svakom_catalog.csv');
            if (file_exists($csvFile)) {
                $file = $csvFile;
            } else {
                $this->error("Catalog file not found: {$file}");
                return 1;
            }
        }

        $this->info("Importing from: {$file}");

        $code = str_ends_with($file, '.json')
            ? $this->importFromJson($file)
            : $this->importFromCsv($file);

        if ($code === 0) {
            // Бренд, честные материалы, тексты без шаблонов, discreet-флаги — см. CatalogCleaner.
            $stats = app(CatalogCleaner::class)->run();
            $this->info("Cleaned {$stats['products']} products, unpublished {$stats['unpublished']}.");
        }

        return $code;
    }

    protected function importFromJson(string $filePath): int
    {
        $raw = file_get_contents($filePath);
        $items = json_decode($raw, true);

        if (!is_array($items)) {
            $this->error('Failed to parse JSON file.');
            return 1;
        }

        $categoryMeta = $this->getCategoryMeta();
        $categories = [];
        foreach ($categoryMeta as $key => $meta) {
            $categories[$key] = Category::updateOrCreate(
                ['slug' => $meta['slug']],
                [
                    'name' => $meta['name'],
                    'tagline' => $meta['tagline'],
                    'description' => $meta['description'],
                    'is_visible' => true,
                    'position' => $meta['position'],
                ]
            );
        }

        $count = 0;
        $featuredSkus = ['SA649A', 'SB504A', 'SA322A', 'SC601A', 'SA511A', 'SB102A'];

        foreach ($items as $index => $item) {
            $title = trim($item['title'] ?? '');
            if (!$title) continue;

            $sku = trim($item['sku'] ?? '') ?: 'SKU-' . ($item['id'] ?? Str::random(6));
            $price = (float) ($item['price'] ?? 0);
            $priceCents = (int) round($price * 100);
            if ($priceCents <= 0) {
                $priceCents = 4900;
            }

            $rawCategory = trim($item['category'] ?? 'Objects');
            $categoryName = $this->cleanCategory($rawCategory, $title, $item['tags'] ?? []);
            $category = $categories[$categoryName] ?? $categories['Objects'];

            $handle = trim($item['handle'] ?? '');
            $slug = $handle ?: Str::slug($title);
            if (Product::where('slug', $slug)->exists()) {
                $slug .= '-' . strtolower(Str::random(4));
            }

            $descriptionHtml = trim($item['description_html'] ?? $item['description_clean'] ?? '');
            $cleanDesc = trim(strip_tags($descriptionHtml));
            $firstSentence = explode('.', $cleanDesc)[0] ?? '';
            // Подзаголовок по словам, без шаблонной заглушки — финально его считает CatalogCleaner.
            $tagline = null;

            $materialsRaw = $item['materials'] ?? '';
            $materials = $this->parseMaterials($materialsRaw, $title, $descriptionHtml);

            $care = trim($item['care'] ?? '') ?: 'Clean thoroughly with warm water and mild soap or a toy cleaner before and after each use. Pat dry and store away from direct sunlight.';

            $isFeatured = in_array($sku, $featuredSkus, true) || ($index < 6 && $index % 2 === 0);

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $title,
                    'tagline' => $tagline,
                    'description' => $descriptionHtml,
                    // Генерированные «история» и «сенсорные характеристики» убраны:
                    // реальных данных у источника нет (аудит, В2/В4).
                    'story' => null,
                    'care' => $care,
                    'materials' => $materials,
                    'price_cents' => $priceCents,
                    'currency' => config('velour.currency', 'EUR'),
                    'status' => ProductStatus::Live,
                    'is_body_safe' => false,
                    'is_featured' => $isFeatured,
                    'published_at' => now()->subHours($index),
                    'attributes' => [],
                ]
            );

            // Variants
            $variants = $item['variants'] ?? [];
            if (empty($variants)) {
                Variant::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'product_id' => $product->id,
                        'name' => 'Standard',
                        'price_cents' => $priceCents,
                        'stock' => (int) ($item['stock'] ?? 15),
                        'is_default' => true,
                        'is_active' => true,
                    ]
                );
            } else {
                foreach ($variants as $vIndex => $v) {
                    $vSku = trim($v['sku'] ?? '') ?: $sku . '-' . ($vIndex + 1);
                    $vPrice = (float) ($v['price'] ?? $price);
                    $vPriceCents = (int) round($vPrice * 100);
                    Variant::updateOrCreate(
                        ['sku' => $vSku],
                        [
                            'product_id' => $product->id,
                            'name' => $this->variantName($v['title'] ?? null),
                            'price_cents' => $vPriceCents > 0 ? $vPriceCents : $priceCents,
                            'stock' => ($v['available'] ?? true) ? 15 : 0,
                            'is_default' => $vIndex === 0,
                            'is_active' => true,
                        ]
                    );
                }
            }

            // Media
            $product->media()->delete();
            $folder = storage_path("app/public/media/{$handle}");
            $pos = 0;

            if (is_dir($folder)) {
                $files = array_values(array_diff(scandir($folder), ['.', '..', '.DS_Store']));
                natsort($files);

                foreach ($files as $file) {
                    $relPath = "media/{$handle}/{$file}";
                    $product->media()->create([
                        'disk' => 'public',
                        'path' => $relPath,
                        'alt' => "{$title} — View " . ($pos + 1),
                        'kind' => MediaKind::Image,
                        'is_discreet_safe' => false,
                        'position' => $pos++,
                        'meta' => [
                            'w' => 1000,
                            'h' => 1000,
                        ],
                    ]);
                }
            } else {
                $images = $item['images'] ?? [];
                foreach ($images as $img) {
                    $imagePath = $img['remote_url'] ?? null;
                    if ($imagePath) {
                        $product->media()->create([
                            'disk' => 'public',
                            'path' => $imagePath,
                            'alt' => "{$title} — View " . ($pos + 1),
                            'kind' => MediaKind::Image,
                            'is_discreet_safe' => false,
                            'position' => $pos++,
                            'meta' => [
                                'w' => $img['width'] ?? 1000,
                                'h' => $img['height'] ?? 1000,
                            ],
                        ]);
                    }
                }
            }

            $count++;
        }

        $this->info("Imported {$count} products with local media successfully.");
        return 0;
    }

    protected function importFromCsv(string $filePath): int
    {
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            $this->error("Unable to open {$filePath}");
            return 1;
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            $this->error("Empty CSV file");
            fclose($handle);
            return 1;
        }

        $headers = array_map(fn($h) => trim($h, "\xEF\xBB\xBF \t\n\r\0\x0B"), $headers);
        $count = 0;
        $categoryMeta = $this->getCategoryMeta();

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), '');
            }
            $data = array_combine(array_slice($headers, 0, count($row)), array_slice($row, 0, count($headers)));

            $title = trim($data['Name'] ?? $data['Title'] ?? '');
            if (!$title) continue;

            $sku = trim($data['SKU'] ?? '') ?: 'SKU-' . Str::random(6);
            $rawPrice = (float) ($data['Price'] ?? $data['Regular price'] ?? 0);
            $priceCents = (int) round($rawPrice * 100);
            if ($priceCents <= 0) $priceCents = 4900;

            $rawCategory = trim($data['Category'] ?? $data['Categories'] ?? 'Objects');
            $categoryName = $this->cleanCategory($rawCategory, $title, []);
            $catInfo = $categoryMeta[$categoryName] ?? $categoryMeta['Objects'];

            $category = Category::firstOrCreate(
                ['slug' => $catInfo['slug']],
                [
                    'name' => $catInfo['name'],
                    'tagline' => $catInfo['tagline'],
                    'description' => $catInfo['description'],
                    'is_visible' => true,
                    'position' => $catInfo['position'],
                ]
            );

            $slug = Str::slug($title);
            if (Product::where('slug', $slug)->exists()) {
                $slug .= '-' . strtolower(Str::random(4));
            }

            $description = trim($data['Description'] ?? '');
            $cleanDesc = trim(strip_tags($description));
            $tagline = Str::limit(explode('.', $cleanDesc)[0] ?? '', 90, '');
            if (!$tagline) $tagline = 'Designed for intuitive touch and quiet power';

            $materials = $this->parseMaterials($data['Materials'] ?? '', $title, $description);
            $care = trim($data['Care'] ?? 'Clean thoroughly with warm water and mild soap before and after each use.');

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $title,
                    'tagline' => $tagline,
                    'description' => $description,
                    'story' => null,
                    'care' => $care,
                    'materials' => $materials,
                    'price_cents' => $priceCents,
                    'currency' => config('velour.currency', 'EUR'),
                    'status' => ProductStatus::Live,
                    'is_body_safe' => false,
                    'is_featured' => false,
                    'published_at' => now(),
                    'attributes' => [],
                ]
            );

            Variant::updateOrCreate(
                ['sku' => $sku],
                [
                    'product_id' => $product->id,
                    'name' => 'Standard',
                    'price_cents' => $priceCents,
                    'stock' => 15,
                    'is_default' => true,
                    'is_active' => true,
                ]
            );

            $count++;
        }

        fclose($handle);
        $this->info("Imported {$count} products successfully from CSV.");
        return 0;
    }

    protected function getCategoryMeta(): array
    {
        return [
            'Objects' => [
                'slug' => 'objects',
                'name' => 'Objects',
                'tagline' => 'Form, weight, temperature',
                'description' => 'Vibrators, wands and personal massagers.',
                'position' => 10,
            ],
            'Silk' => [
                'slug' => 'silk',
                'name' => 'Silk',
                'tagline' => 'The first thing to touch skin',
                'description' => 'Pouches, chargers and accessories.',
                'position' => 20,
            ],
            'Rituals' => [
                'slug' => 'rituals',
                'name' => 'Rituals',
                'tagline' => 'Before and after',
                'description' => 'Cleaning and care essentials.',
                'position' => 30,
            ],
            'Sensations' => [
                'slug' => 'sensations',
                'name' => 'Sensations',
                'tagline' => 'Tension, texture, release',
                'description' => 'Strokers, sleeves, rings and prostate massagers.',
                'position' => 40,
            ],
            'Intimacy' => [
                'slug' => 'intimacy',
                'name' => 'Intimacy',
                'tagline' => 'App-connected play, shared curiosity',
                'description' => 'App-connected and couples’ toys.',
                'position' => 50,
            ],
        ];
    }

    protected function cleanCategory(string $raw, string $title, array $tags): string
    {
        $combined = strtolower($raw . ' ' . $title . ' ' . implode(' ', $tags));

        if (str_contains($combined, 'cleaner') || str_contains($combined, 'care & cleaners') || str_contains($combined, 'toy cleaner') || str_contains($combined, 'lube') || str_contains($combined, 'oil')) {
            return 'Rituals';
        }
        if (str_contains($combined, 'socks') || str_contains($combined, 'tote') || str_contains($combined, 'cap') || str_contains($combined, 'fan') || str_contains($combined, 'storage bag') || str_contains($combined, 'apparel') || str_contains($combined, 'pouch')) {
            return 'Silk';
        }
        if (str_contains($combined, 'masturbator') || str_contains($combined, 'sleeve') || str_contains($combined, 'cock ring') || str_contains($combined, 'prostate') || str_contains($combined, 'leather') || str_contains($combined, 'bdsm') || str_contains($combined, 'jetpack') || str_contains($combined, 'shotty')) {
            return 'Sensations';
        }
        if (str_contains($combined, 'couples') || str_contains($combined, 'interactive') || str_contains($combined, 'bluetooth') || str_contains($combined, 'app-controlled') || str_contains($combined, 'engraving') || str_contains($combined, 'self-love') || str_contains($combined, 'gift')) {
            return 'Intimacy';
        }

        return 'Objects';
    }

    protected function parseMaterials(string $materialsRaw, string $title, string $desc): array
    {
        $text = strtolower($materialsRaw . ' ' . $title . ' ' . $desc);
        $list = [];

        if (str_contains($text, 'silicone')) $list[] = 'Silicone';
        if (str_contains($text, 'abs')) $list[] = 'ABS plastic';
        if (str_contains($text, 'glass') || str_contains($text, 'borosilicate')) $list[] = 'Borosilicate Glass';
        if (str_contains($text, 'steel') || str_contains($text, 'metal') || str_contains($text, 'zinc')) $list[] = 'Solid Zinc / Stainless Alloy';
        if (str_contains($text, 'leather')) $list[] = 'Genuine Supple Leather';
        if (str_contains($text, 'cotton') || str_contains($text, 'textile') || str_contains($text, 'canvas')) $list[] = 'Organic Cotton Canvas';

        return array_values(array_unique($list));
    }


    /** «Default Title» — служебное имя Shopify для единственного варианта. */
    protected function variantName(?string $title): string
    {
        $title = trim((string) $title);

        return ($title === '' || strcasecmp($title, 'Default Title') === 0) ? 'Standard' : $title;
    }
}
