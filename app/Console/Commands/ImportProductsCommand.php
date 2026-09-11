<?php

namespace App\Console\Commands;

use App\Enums\MediaKind;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Variant;
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

        if (str_ends_with($file, '.json')) {
            return $this->importFromJson($file);
        }

        return $this->importFromCsv($file);
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
            $tagline = Str::limit(trim($firstSentence), 90, '');
            if (!$tagline || strlen($tagline) < 10) {
                $tagline = 'Designed for intuitive touch, quiet power, and intimate discovery';
            }

            $materialsRaw = $item['materials'] ?? '';
            $materials = $this->parseMaterials($materialsRaw, $title, $descriptionHtml);

            $care = trim($item['care'] ?? '');
            if (!$care) {
                $care = 'Clean thoroughly with warm water and mild soap or specialized toy cleaner before and after each use. Pat dry with a lint-free cloth and store away from direct sunlight.';
            }

            $story = $this->generateStory($title, $materials, $categoryName);

            $sensory = $this->generateSensory($materials, $title, $categoryName);

            $isFeatured = in_array($sku, $featuredSkus, true) || ($index < 6 && $index % 2 === 0);

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $category->id,
                    'name' => $title,
                    'tagline' => $tagline,
                    'description' => $descriptionHtml,
                    'story' => $story,
                    'care' => $care,
                    'materials' => $materials,
                    'price_cents' => $priceCents,
                    'currency' => config('velour.currency', 'EUR'),
                    'status' => ProductStatus::Live,
                    'is_body_safe' => true,
                    'is_featured' => $isFeatured,
                    'published_at' => now()->subHours($index),
                    'attributes' => $sensory,
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
                            'name' => trim($v['title'] ?? 'Standard') ?: 'Standard',
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
                        'is_discreet_safe' => true,
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
                            'is_discreet_safe' => true,
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
                    'story' => $this->generateStory($title, $materials, $categoryName),
                    'care' => $care,
                    'materials' => $materials,
                    'price_cents' => $priceCents,
                    'currency' => config('velour.currency', 'EUR'),
                    'status' => ProductStatus::Live,
                    'is_body_safe' => true,
                    'is_featured' => false,
                    'published_at' => now(),
                    'attributes' => $this->generateSensory($materials, $title, $categoryName),
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
                'description' => 'Sculpted from body-safe silicone, borosilicate glass, and solid alloy.',
                'position' => 10,
            ],
            'Silk' => [
                'slug' => 'silk',
                'name' => 'Silk',
                'tagline' => 'The first thing to touch skin',
                'description' => 'Delicate accessories, tactile pouches, and intimate apparel.',
                'position' => 20,
            ],
            'Rituals' => [
                'slug' => 'rituals',
                'name' => 'Rituals',
                'tagline' => 'Oils, balms, time',
                'description' => 'Gentle cleansing formulas, restorative glides, and care essentials.',
                'position' => 30,
            ],
            'Sensations' => [
                'slug' => 'sensations',
                'name' => 'Sensations',
                'tagline' => 'Tension, texture, release',
                'description' => 'Targeted stimulation, ergonomic rings, and deep male pleasure toys.',
                'position' => 40,
            ],
            'Intimacy' => [
                'slug' => 'intimacy',
                'name' => 'Intimacy',
                'tagline' => 'App-connected play, shared curiosity',
                'description' => 'Bluetooth-enabled devices, couple kits, and customizable keepsakes.',
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

        if (str_contains($text, 'silicone')) $list[] = 'Medical-Grade Silicone';
        if (str_contains($text, 'abs')) $list[] = 'ABS Polymer (Phthalate-free)';
        if (str_contains($text, 'glass') || str_contains($text, 'borosilicate')) $list[] = 'Borosilicate Glass';
        if (str_contains($text, 'steel') || str_contains($text, 'metal') || str_contains($text, 'zinc')) $list[] = 'Solid Zinc / Stainless Alloy';
        if (str_contains($text, 'leather')) $list[] = 'Genuine Supple Leather';
        if (str_contains($text, 'cotton') || str_contains($text, 'textile') || str_contains($text, 'canvas')) $list[] = 'Organic Cotton Canvas';

        if (empty($list)) {
            $list = ['Medical-Grade Silicone', 'ABS Polymer (Phthalate-free)'];
        }

        return array_values(array_unique($list));
    }

    protected function generateStory(string $title, array $materials, string $category): string
    {
        $materialStr = implode(' and ', array_slice($materials, 0, 2));
        return "Crafted from velvety {$materialStr}. Designed with quiet sophistication, subtle contours, and seamless ergonomics for effortless private enjoyment.";
    }

    protected function generateSensory(array $materials, string $title, string $category): array
    {
        $lower = strtolower($title . ' ' . implode(' ', $materials));

        $firmness = 3;
        $texture = 'silk';
        $weight = 3;
        $noise = 1;
        $temperature = 'body-warm';
        $waterproof = true;

        if (str_contains($lower, 'cable') || str_contains($lower, 'cleaner') || str_contains($lower, 'bag') || str_contains($lower, 'socks') || str_contains($lower, 'cap')) {
            $firmness = 1;
            $noise = 1;
            $waterproof = false;
        } elseif (str_contains($lower, 'wand') || str_contains($lower, 'thrusting') || str_contains($lower, 'rabbit')) {
            $firmness = 3;
            $noise = 2;
            $weight = 4;
        } elseif (str_contains($lower, 'glass') || str_contains($lower, 'steel')) {
            $firmness = 5;
            $texture = 'polished';
            $temperature = 'holds-cool';
            $weight = 4;
        }

        return [
            'firmness' => $firmness,
            'texture' => $texture,
            'weight' => $weight,
            'noise' => $noise,
            'temperature' => $temperature,
            'waterproof' => $waterproof,
            'lube_safe' => !str_contains($lower, 'silicone'),
        ];
    }
}
