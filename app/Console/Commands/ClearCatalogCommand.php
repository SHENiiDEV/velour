<?php

namespace App\Console\Commands;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\Variant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearCatalogCommand extends Command
{
    protected $signature = 'catalog:clear 
                            {--force : Bypass confirmation prompt}
                            {--keep-categories : Do not delete categories}';

    protected $description = 'Safely wipe all catalog products, variants, media, and attributes while preserving orders and users';

    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('Are you sure you want to wipe all catalog products, variants, and media?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $this->warn('Clearing catalog...');

        DB::transaction(function () {
            // Отключаем внешние ключи для чистого усечения или каскадного удаления
            Schema::disableForeignKeyConstraints();

            // 1. Очищаем позиции в корзинах (ссылающиеся на товары)
            CartItem::truncate();

            // 2. Очищаем медиафайлы товаров и вариантов
            Media::whereIn('mediable_type', [Product::class, Variant::class, Category::class])->delete();

            // 3. Очищаем плоские атрибуты для фильтрации
            ProductAttribute::truncate();

            // 4. Очищаем варианты и товары (включая soft-deleted)
            Variant::truncate();
            Product::withTrashed()->forceDelete();

            // 5. Опционально очищаем категории
            if (! $this->option('keep-categories')) {
                Category::truncate();
                $this->line('  ✓ Categories wiped');
            }

            Schema::enableForeignKeyConstraints();
        });

        $this->info('✓ Catalog successfully cleared! You can now run `php artisan catalog:import`.');

        return 0;
    }
}
