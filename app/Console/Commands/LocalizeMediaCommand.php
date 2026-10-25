<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Переносит фото с чужого CDN (cdn.shopify.com) на наш диск public.
 * Зачем: картинки не пропадут, если исходный магазин удалит файлы; IP посетителей
 * не уходит третьей стороне до согласия (GDPR); можно отдать нужный размер.
 *
 *   php artisan velour:media-localize            — скачать всё внешнее
 *   php artisan velour:media-localize --max=1600 — заодно ужать до 1600px и в WebP (нужен GD)
 *
 * Идемпотентна: уже локальные файлы пропускает. Не забудь `php artisan storage:link`.
 */
class LocalizeMediaCommand extends Command
{
    protected $signature = 'velour:media-localize
        {--max=1600 : максимальная сторона в пикселях при перекодировании (0 — не трогать)}
        {--quality=82 : качество WebP}';

    protected $description = 'Скачать внешние фото товаров на свой хостинг (и ужать в WebP)';

    public function handle(): int
    {
        $max = (int) $this->option('max');
        $quality = (int) $this->option('quality');
        $canEncode = function_exists('imagewebp') && function_exists('imagecreatefromstring');

        if ($max > 0 && ! $canEncode) {
            $this->warn('GD с поддержкой WebP не найден — файлы сохранятся как есть, без ужатия.');
        }

        $query = Media::query()->where(fn ($q) => $q->where('path', 'like', 'http://%')->orWhere('path', 'like', 'https://%'));
        $total = $query->count();

        if ($total === 0) {
            $this->info('Внешних фото нет — всё уже на своём хостинге.');

            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($total);
        $failed = 0;

        $query->orderBy('id')->chunkById(50, function ($items) use ($bar, $max, $quality, $canEncode, &$failed) {
            foreach ($items as $media) {
                $bar->advance();

                try {
                    $response = Http::timeout(30)->retry(2, 500)->get($media->path);
                    if (! $response->successful()) {
                        $failed++;
                        continue;
                    }

                    $bytes = $response->body();
                    $folder = 'media/'.($media->mediable_id ?? 'misc');
                    $base = Str::slug(pathinfo(parse_url($media->path, PHP_URL_PATH) ?: Str::random(8), PATHINFO_FILENAME)) ?: Str::random(8);
                    [$bytes, $ext, $w, $h] = $this->encode($bytes, $max, $quality, $canEncode, $media->path);

                    $path = "{$folder}/{$base}.{$ext}";
                    Storage::disk('public')->put($path, $bytes);

                    $media->forceFill([
                        'disk' => 'public',
                        'path' => $path,
                        'meta' => array_merge($media->meta ?? [], array_filter(['w' => $w, 'h' => $h])),
                    ])->save();
                } catch (\Throwable $e) {
                    $failed++;
                    report($e);
                }
            }
        });

        $bar->finish();
        $this->newLine(2);
        $this->info('Перенесено: '.($total - $failed)." из {$total}");
        if ($failed > 0) {
            $this->warn("Не удалось скачать: {$failed} (повтори команду позже).");
        }

        return self::SUCCESS;
    }

    /** @return array{0:string,1:string,2:?int,3:?int} */
    protected function encode(string $bytes, int $max, int $quality, bool $canEncode, string $url): array
    {
        $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION)) ?: 'jpg';

        if ($max <= 0 || ! $canEncode) {
            return [$bytes, $ext, null, null];
        }

        $image = @imagecreatefromstring($bytes);
        if ($image === false) {
            return [$bytes, $ext, null, null];
        }

        $w = imagesx($image);
        $h = imagesy($image);
        $scale = min(1, $max / max($w, $h));

        if ($scale < 1) {
            $nw = (int) round($w * $scale);
            $nh = (int) round($h * $scale);
            $resized = imagecreatetruecolor($nw, $nh);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($image);
            $image = $resized;
            [$w, $h] = [$nw, $nh];
        } else {
            imagepalettetotruecolor($image);
            imagesavealpha($image, true);
        }

        ob_start();
        imagewebp($image, null, $quality);
        $out = (string) ob_get_clean();
        imagedestroy($image);

        return [$out, 'webp', $w, $h];
    }
}
