<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

/**
 * Выгрузка каталога в CSV: главная картинка, название, цена в EUR.
 *   php artisan velour:export-csv                       → storage/app/products-export.csv
 *   php artisan velour:export-csv /tmp/products.csv --all   (включая черновики)
 * Ссылки на картинки абсолютные — домен берётся из APP_URL.
 * UTF-8 с BOM, чтобы Excel открывал без кракозябр.
 */
class ExportProductsCsv extends Command
{
    protected $signature = 'velour:export-csv
        {file? : куда сохранить (по умолчанию storage/app/products-export.csv)}
        {--all : выгрузить все товары, а не только опубликованные}';

    protected $description = 'Выгрузить товары в CSV (Image, Name, Price)';

    public function handle(): int
    {
        $file = $this->argument('file') ?? storage_path('app/products-export.csv');
        $handle = fopen($file, 'w');

        if ($handle === false) {
            $this->error("Не удалось открыть файл: {$file}");

            return self::FAILURE;
        }

        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, ['Image', 'Name', 'Price']);

        $count = 0;

        Product::query()
            ->when(! $this->option('all'), fn ($q) => $q->live())
            ->with([
                'variants',
                'media' => fn ($q) => $q->where('kind', 'image')->orderBy('position')->orderBy('id'),
            ])
            ->orderBy('name')
            ->chunk(200, function ($products) use ($handle, &$count) {
                foreach ($products as $product) {
                    $media = $product->media->first();

                    fputcsv($handle, [
                        $media ? url($media->url()) : '',
                        $product->name,
                        number_format($product->priceFromCents() / 100, 2, '.', ''),
                    ]);

                    $count++;
                }
            });

        fclose($handle);

        $this->info("Выгружено товаров: {$count} → {$file}");

        return self::SUCCESS;
    }
}
