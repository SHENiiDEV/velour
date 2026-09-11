<?php

namespace App\Console\Commands;

use App\Enums\MediaKind;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Variant;
use App\Support\Woo\WooCsvParser;
use App\Support\Woo\WooProduct;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Импорт экспорта WooCommerce (Products → Export) в каталог VELOUR.
 *
 * Идемпотентен: товар опознаётся по паре source + source_id, повторный запуск
 * обновляет цену, остаток, описание и картинки, а не создаёт дубли.
 */
class ImportWooProducts extends Command
{
    protected $signature = 'velour:import-woo
        {file : путь к CSV-выгрузке WooCommerce}
        {--currency= : валюта цен в файле (по умолчанию velour.currency)}
        {--fallback=Other : категория для товаров без своей}
        {--draft : положить импортированное в черновики, а не сразу в продажу}
        {--discreet-safe : считать импортированные кадры безопасными для скрытного режима}
        {--dry-run : разобрать и показать итог, ничего не записывая}';

    protected $description = 'Импортировать товары из CSV-экспорта WooCommerce';

    public function handle(WooCsvParser $parser): int
    {
        $file = $this->argument('file');

        if (! is_readable($file)) {
            $this->error("Файл не найден или недоступен: {$file}");

            return self::FAILURE;
        }

        $currency = strtoupper($this->option('currency') ?: config('velour.currency'));
        $dry = (bool) $this->option('dry-run');
        $created = $updated = 0;

        $this->line("Валюта импорта: <options=bold>{$currency}</>".($dry ? '  (пробный прогон)' : ''));

        foreach ($parser->parse($file) as $item) {
            if ($dry) {
                $created++;

                continue;
            }

            DB::transaction(function () use ($item, $currency, &$created, &$updated) {
                $existing = Product::withTrashed()
                    ->where('source', WooCsvParser::SOURCE)
                    ->where('source_id', $item->sourceId)
                    ->first()
                    ?? $this->adoptBySku($item);

                $product = $this->saveProduct($item, $currency, $existing);

                $existing ? $updated++ : $created++;

                $this->saveVariant($item, $product);
                $this->saveMedia($item, $product);
            });
        }

        foreach ($parser->skipped as $reason) {
            $this->warn("пропущено: {$reason}");
        }

        $this->newLine();
        $this->info($dry
            ? "Разобрано {$created} товаров, пропущено ".count($parser->skipped).'. Записи не менялись.'
            : "Готово. Создано: {$created}, обновлено: {$updated}, пропущено: ".count($parser->skipped).'.');

        if (! $dry) {
            $this->line('<comment>Изображения подключены ссылками на исходный сайт. Перед запуском их нужно перенести к себе: чужой хостинг может их удалить или закрыть хотлинк.</comment>');
        }

        return self::SUCCESS;
    }

    protected function saveProduct(WooProduct $item, string $currency, ?Product $existing): Product
    {
        $category = $this->resolveCategory($item->categoryPath);

        $status = $this->option('draft') || ! $item->isPublished
            ? ProductStatus::Draft
            : ProductStatus::Live;

        $product = $existing ?? new Product();

        $product->fill([
            'source' => WooCsvParser::SOURCE,
            'source_id' => $item->sourceId,
            'category_id' => $category->id,
            'slug' => $product->slug ?: $this->uniqueSlug($item),
            'name' => $item->name,
            'tagline' => $item->tagline,
            'description' => $item->description,
            'price_cents' => $item->priceCents,
            'currency' => $currency,
            'status' => $status,
            'is_featured' => $item->isFeatured,
            'brand' => $item->brand,
            'gtin' => $item->gtin,
            'mpn' => $item->mpn,
            'published_at' => $product->published_at ?? now(),
            // Материалы и сенсорные характеристики в выгрузке Woo отсутствуют —
            // оставляем пустыми, чтобы не выдумывать за производителя.
        ]);

        $product->deleted_at = null;
        $product->save();

        return $product;
    }

    protected function saveVariant(WooProduct $item, Product $product): void
    {
        Variant::updateOrCreate(
            ['sku' => $item->sku],
            [
                'product_id' => $product->id,
                'name' => $item->name,
                'price_cents' => null,   // цена берётся у товара
                'stock' => $item->stock,
                'weight_g' => $item->weightG,
                'is_default' => true,
                'is_active' => true,
            ],
        );
    }

    protected function saveMedia(WooProduct $item, Product $product): void
    {
        if ($item->images === []) {
            return;
        }

        // Переливаем список целиком: порядок кадров в выгрузке — это порядок галереи.
        $product->media()->delete();

        foreach ($item->images as $position => $url) {
            $product->media()->create([
                'path' => $url,
                'alt' => $item->name,
                'kind' => MediaKind::Image,
                // Предметные кадры производителя — не для скрытного режима без blur.
                'is_discreet_safe' => (bool) $this->option('discreet-safe'),
                'position' => $position,
            ]);
        }
    }

    /** @param  list<string>  $path */
    protected function resolveCategory(array $path): Category
    {
        if ($path === []) {
            $path = [(string) $this->option('fallback')];
        }

        $parent = null;
        $walked = [];

        foreach ($path as $name) {
            $walked[] = $name;
            $parent = $this->findOrCreateCategory($name, $walked, $parent);
        }

        return $parent;
    }

    /** @param  list<string>  $walked */
    protected function findOrCreateCategory(string $name, array $walked, ?Category $parent): Category
    {
        $existing = Category::where('name', $name)->where('parent_id', $parent?->id)->first();

        if ($existing) {
            return $existing;
        }

        // Одноимённые ветки в разных местах дерева не должны драться за slug.
        $slug = Str::slug($name);

        if (Category::where('slug', $slug)->exists()) {
            $slug = Str::slug(implode(' ', $walked));
        }

        return Category::create([
            'parent_id' => $parent?->id,
            'slug' => $slug,
            'name' => $name,
            'is_visible' => true,
            'position' => 100,
        ]);
    }

    /**
     * Товар мог приехать в каталог до появления source_id — например, ручным
     * импортом. Опознаём его по артикулу и берём под управление команды,
     * иначе повторный импорт создаст дубль.
     */
    protected function adoptBySku(WooProduct $item): ?Product
    {
        $variant = Variant::withoutGlobalScopes()->firstWhere('sku', $item->sku);

        if (! $variant) {
            return null;
        }

        $product = Product::withTrashed()->find($variant->product_id);

        if ($product && $product->source === null) {
            $this->line("  усыновлён по SKU {$item->sku}: {$product->name}");
        }

        return $product;
    }

    protected function uniqueSlug(WooProduct $item): string
    {
        $base = Str::slug($item->name) ?: 'item';
        $slug = $base;

        // У трёх товаров в выгрузке совпадают имена — различаем их артикулом.
        if (Product::where('slug', $slug)->exists()) {
            $slug = $base.'-'.Str::slug($item->sku);
        }

        return $slug;
    }
}
