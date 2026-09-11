<?php

namespace App\Support\Woo;

use RuntimeException;

/**
 * Разбор экспорта WooCommerce (Products → Export).
 *
 * Намеренно без зависимостей от Laravel: это чистая трансформация данных,
 * которую можно прогнать и протестировать отдельно от приложения.
 */
final class WooCsvParser
{
    public const SOURCE = 'woocommerce';

    /** Категории-заглушки Woo, которые не несут смысла. */
    private const JUNK_CATEGORIES = ['uncategorized', 'merged term name'];

    /** @var list<string> Строки, пропущенные при разборе, с причиной. */
    public array $skipped = [];

    /**
     * @return \Generator<int, WooProduct>
     */
    public function parse(string $path): \Generator
    {
        $handle = @fopen($path, 'r');

        if ($handle === false) {
            throw new RuntimeException("Не удалось открыть файл: {$path}");
        }

        try {
            $header = fgetcsv($handle, escape: '');

            if ($header === false) {
                throw new RuntimeException('Файл пуст.');
            }

            // Woo кладёт BOM в начало первой ячейки.
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $header[0]);

            while (($line = fgetcsv($handle, escape: '')) !== false) {
                if ($line === [null] || $line === ['']) {
                    continue;
                }

                $row = @array_combine($header, array_pad(array_slice($line, 0, count($header)), count($header), ''));

                if ($row === false) {
                    continue;
                }

                $product = $this->toProduct($row);

                if ($product !== null) {
                    yield $product;
                }
            }
        } finally {
            fclose($handle);
        }
    }

    /** @param array<string, string|null> $row */
    public function toProduct(array $row): ?WooProduct
    {
        $type = strtolower(trim((string) ($row['Type'] ?? '')));
        $name = trim((string) ($row['Name'] ?? ''));
        $sku = trim((string) ($row['SKU'] ?? ''));
        $id = trim((string) ($row['ID'] ?? ''));

        // Вариативные товары Woo хранят варианты отдельными строками с Parent —
        // это отдельная задача, сейчас берём только простые.
        if ($type !== 'simple') {
            $this->skipped[] = "{$id} ({$name}): тип «{$type}» пока не поддерживается";

            return null;
        }

        if ($name === '' || $id === '') {
            $this->skipped[] = "{$id}: нет имени или ID";

            return null;
        }

        $price = $this->priceCents($row['Sale price'] ?? '') ?? $this->priceCents($row['Regular price'] ?? '');

        if ($price === null) {
            $this->skipped[] = "{$id} ({$name}): нет цены";

            return null;
        }

        $description = $this->htmlToText((string) ($row['Description'] ?? ''));
        $short = $this->htmlToText((string) ($row['Short description'] ?? ''));

        $attributes = $this->attributes($row);

        return new WooProduct(
            sourceId: $id,
            sku: $sku !== '' ? $sku : "WOO-{$id}",
            name: $name,
            tagline: $this->tagline($short !== '' ? $short : $description),
            description: $description,
            categoryPath: $this->categoryPath((string) ($row['Categories'] ?? '')),
            priceCents: $price,
            stock: $this->stock($row),
            isPublished: trim((string) ($row['Published'] ?? '')) === '1',
            isFeatured: trim((string) ($row['Is featured?'] ?? '')) === '1',
            weightG: $this->weightG($row['Weight (kg)'] ?? ''),
            brand: $attributes['brand'] ?? null,
            gtin: $this->firstFilled([$row['GTIN, UPC, EAN, or ISBN'] ?? '', $attributes['upc'] ?? '']),
            mpn: $attributes['mpn'] ?? null,
            images: $this->images((string) ($row['Images'] ?? '')),
        );
    }

    /** «54.99» → 5499. Пустое или не число → null. */
    public function priceCents(?string $value): ?int
    {
        $value = trim((string) $value);

        if ($value === '' || ! is_numeric($value)) {
            return null;
        }

        return (int) round(((float) $value) * 100);
    }

    /** @param array<string, string|null> $row */
    private function stock(array $row): int
    {
        if (trim((string) ($row['In stock?'] ?? '')) !== '1') {
            return 0;
        }

        $stock = trim((string) ($row['Stock'] ?? ''));

        return is_numeric($stock) ? max(0, (int) $stock) : 0;
    }

    private function weightG(?string $kg): ?int
    {
        $kg = trim((string) $kg);

        return $kg !== '' && is_numeric($kg) ? (int) round(((float) $kg) * 1000) : null;
    }

    /**
     * Атрибуты Woo лежат парами колонок. Здесь только служебные (UPC, MPN, brand) —
     * сенсорные характеристики мы не выдумываем: их в экспорте нет.
     *
     * @param  array<string, string|null>  $row
     * @return array<string, string>
     */
    private function attributes(array $row): array
    {
        $out = [];

        for ($i = 1; $i <= 10; $i++) {
            $name = strtolower(trim((string) ($row["Attribute {$i} name"] ?? '')));
            $value = trim((string) ($row["Attribute {$i} value(s)"] ?? ''));

            if ($name !== '' && $value !== '') {
                $out[$name] = $value;
            }
        }

        return $out;
    }

    /**
     * «Latex > Rechargable > Kits» → ['Latex', 'Rechargable', 'Kits'].
     * Мусорные категории Woo отбрасываем — товар уедет в запасную.
     *
     * @return list<string>
     */
    public function categoryPath(string $value): array
    {
        // Товар может быть в нескольких категориях через запятую — берём первую.
        $first = trim(explode(',', $value)[0] ?? '');

        if ($first === '') {
            return [];
        }

        $path = [];

        foreach (explode('>', $first) as $part) {
            $part = trim(html_entity_decode($part, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

            if ($part !== '' && ! in_array(strtolower($part), self::JUNK_CATEGORIES, true)) {
                $path[] = $part;
            }
        }

        return $path;
    }

    /** @return list<string> */
    public function images(string $value): array
    {
        $out = [];

        foreach (explode(',', $value) as $url) {
            $url = trim($url);

            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                $out[] = $url;
            }
        }

        return array_values(array_unique($out));
    }

    /** HTML описания Woo → читаемый текст с пустой строкой между абзацами. */
    public function htmlToText(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $text = preg_replace('#<br\s*/?>#i', "\n", $html) ?? $html;
        $text = preg_replace('#</(p|div|li|h[1-6])>#i', "\n\n", $text) ?? $text;
        $text = preg_replace('#<li[^>]*>#i', '— ', $text) ?? $text;
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = str_replace("\u{a0}", ' ', $text);
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }

    /**
     * Строка-намёк для карточки: первое предложение продавца, если оно короткое.
     * Свой копирайт не сочиняем.
     */
    public function tagline(string $text): ?string
    {
        $text = trim($text);

        if ($text === '') {
            return null;
        }

        $first = preg_split('/(?<=[.!?])\s+/', $text, 2)[0] ?? $text;
        $first = trim($first);

        return mb_strlen($first) > 0 && mb_strlen($first) <= 140 ? $first : null;
    }

    /** @param list<string> $candidates */
    private function firstFilled(array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            $candidate = trim((string) $candidate);

            if ($candidate !== '') {
                return $candidate;
            }
        }

        return null;
    }
}
