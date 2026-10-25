<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogCleaner;
use Illuminate\Console\Command;

/**
 * Чистка импортированного каталога (бренд, материалы, тексты, характеристики, фото).
 * Идемпотентна — безопасно запускать повторно и на проде:
 *   php artisan velour:catalog-clean
 */
class CleanCatalogCommand extends Command
{
    protected $signature = 'velour:catalog-clean';

    protected $description = 'Привести импортированные карточки к честному виду: бренд, материалы, тексты, характеристики, discreet-флаги';

    public function handle(CatalogCleaner $cleaner): int
    {
        $bar = $this->output->createProgressBar();
        $stats = $cleaner->run(fn () => $bar->advance());
        $bar->finish();
        $this->newLine(2);

        $this->info("Товаров обработано: {$stats['products']}");
        $this->info("Снято с витрины (мерч, гравировка): {$stats['unpublished']}");
        $this->info("Фото обновлено (скрытный режим, alt): {$stats['media']}");

        return self::SUCCESS;
    }
}
