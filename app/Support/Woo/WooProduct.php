<?php

namespace App\Support\Woo;

/** Одна строка экспорта WooCommerce, приведённая к нашим понятиям. */
final readonly class WooProduct
{
    public function __construct(
        public string $sourceId,
        public string $sku,
        public string $name,
        public ?string $tagline,
        public string $description,
        /** @var list<string> Путь категорий: ['Latex', 'Rechargable', 'Kits'] */
        public array $categoryPath,
        public int $priceCents,
        public int $stock,
        public bool $isPublished,
        public bool $isFeatured,
        public ?int $weightG,
        public ?string $brand,
        public ?string $gtin,
        public ?string $mpn,
        /** @var list<string> Абсолютные URL изображений */
        public array $images,
    ) {}
}
