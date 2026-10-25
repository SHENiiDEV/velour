<?php

namespace App\Services\Catalog;

use App\Enums\ProductStatus;
use App\Models\AttributeDefinition;
use App\Models\Category;
use App\Models\Product;
use App\Support\HtmlSanitizer;

/**
 * Приводит импортированные карточки (выгрузка магазина производителя) к честному виду VELOUR.
 *
 * Идемпотентно — можно гонять сколько угодно раз, в том числе на проде:
 *   php artisan velour:catalog-clean
 *
 * Что делает и почему (см. аудит 25.10.2026):
 * - К3: материалы — только те, что названы в тексте самого товара, без «Medical-Grade»
 *   и без значка «Body-safe» (его включает человек, имея документы производителя).
 * - К4: бренд производителя — в поле brand, а не в названии; ссылки на чужой магазин,
 *   «Buy … Online Shop», блоки FAQ — вырезаются; мерч производителя снимается с витрины.
 * - К6: услуга гравировки снимается с витрины, пока нет поля для текста.
 * - К2: все фото по умолчанию НЕ безопасны для скрытного режима (размываются).
 * - В2: выдуманные «сенсорные» характеристики удаляются — реальных данных нет.
 * - В4: шаблонные подзаголовки/истории/уход удаляются, подзаголовок режется по словам.
 */
class CatalogCleaner
{
    /** Мерч и сервисы, которым не место на витрине. */
    protected const UNPUBLISH = [
        '/^(svakom\s+)?(cap|pen|socks|tote bag|pride fan|mood light|storage bag|lanyard|sticker)\b/i',
        '/^engraving service$/i',
    ];

    /** Товары, которые не касаются тела: блок материалов/ухода для них не нужен. */
    protected const NON_BODY = '/\b(cable|charger|charging|bag|socks|cap|pen|fan|light|lanyard|sticker|clean stuff|cleaner)\b/i';

    /** Материалы, которые честно можно вывести из текста карточки. */
    protected const MATERIALS = [
        'Silicone' => '/\bsilicone\b/i',
        'ABS plastic' => '/\bABS\b/',
        'TPE' => '/\bTPE\b/',
        'TPR' => '/\bTPR\b/',
        'Stainless steel' => '/\bstainless steel\b/i',
        'Aluminium alloy' => '/\balumin(i)?um\b/i',
        'Zinc alloy' => '/\bzinc\b/i',
        'Glass' => '/\b(borosilicate|glass)\b/i',
        'Genuine leather' => '/\b(genuine|real) leather\b/i',
        'Vegan leather' => '/\b(vegan|PU) leather\b/i',
        'Cotton' => '/\bcotton\b/i',
    ];

    /** Шаблоны, которые генерировал старый импорт. */
    protected const PLACEHOLDER_TAGLINES = [
        'Designed for intuitive touch, quiet power, and intimate discovery',
        'Designed for intuitive touch and quiet power',
    ];

    protected const TYPOS = [
        "hearts content" => "heart's content",
        'Coleur D’or' => "Couleur d'Or",
        "Coleur D'or" => "Couleur d'Or",
        'a SVAKOM Intelligent Mode' => 'an Intelligent Mode',
        'SVAKOM Intelligent Mode' => 'Intelligent Mode',
        'a Intelligent Mode' => 'an Intelligent Mode',
        // ELMER — машинный перевод производителя (аудит, М9).
        'which highly imitates the vibration frequency in the whole process of sex from the beginning to orgasm.' => 'that follows the natural rise of arousal, from the first slow build to the peak.',
        'Single-click the S button, you can start a wonderful sex journey.' => 'One press of the S button is all it takes.',
        'From bashful foreplay, sexy teasing, strong pulsing, to multiple climaxes, it brings you a heavenly sex experience you don\'t want to miss.' => 'It moves from shy, gentle teasing to strong pulses and repeated peaks — an arc worth following to the end.',
    ];

    /** Честные описания категорий — под реальный ассортимент (В7). */
    public const CATEGORY_COPY = [
        'objects' => ['tagline' => 'Form, weight, rhythm', 'description' => 'Vibrators, wands and personal massagers.'],
        'silk' => ['tagline' => 'Small things that travel with you', 'description' => 'Pouches, chargers and accessories.'],
        'rituals' => ['tagline' => 'Before and after', 'description' => 'Cleaning and care essentials.'],
        'sensations' => ['tagline' => 'Tension, texture, release', 'description' => 'Strokers, sleeves, rings and prostate massagers.'],
        'intimacy' => ['tagline' => 'Shared curiosity', 'description' => 'App-connected and couples’ toys.'],
    ];

    /** @return array{products:int, unpublished:int, media:int} */
    public function run(?callable $progress = null): array
    {
        $stats = ['products' => 0, 'unpublished' => 0, 'media' => 0];

        foreach (self::CATEGORY_COPY as $slug => $copy) {
            Category::where('slug', $slug)->update($copy);
        }

        // Шкала шумности: 1 точка = тихо, «Quiet» читалось наоборот (М12).
        AttributeDefinition::where('key', 'noise')->where('label', 'Quiet')->update(['label' => 'Noise level']);

        Product::query()->with('media')->orderBy('id')->chunkById(100, function ($products) use (&$stats, $progress) {
            foreach ($products as $product) {
                $result = $this->clean($product);
                $stats['products']++;
                $stats['unpublished'] += $result['unpublished'] ? 1 : 0;
                $stats['media'] += $result['media'];
                $progress && $progress($product);
            }
        });

        return $stats;
    }

    /** @return array{unpublished:bool, media:int} */
    public function clean(Product $product): array
    {
        $name = $this->cleanName($product->name);
        $html = $this->cleanDescription($product->description, $product->name);
        $text = $this->plain($html);
        // Для подзаголовка — текст без заголовков («Triooo – Versatile Cock Ring Set» без точки
        // склеивался бы со следующим предложением).
        $body = $this->plain(preg_replace('#<(h3|h4)>.*?</\1>#is', ' ', (string) $html));
        $haystack = $product->name.' '.$text;
        $nonBody = (bool) preg_match(self::NON_BODY, $product->name);

        $unpublish = false;
        foreach (self::UNPUBLISH as $pattern) {
            if (preg_match($pattern, trim($product->name))) {
                $unpublish = true;
            }
        }

        $care = $product->care;
        if ($nonBody && ! str_contains(strtolower((string) $care), 'bottle')) {
            $care = null;
        }

        $product->fill([
            'name' => $name,
            'brand' => $product->brand ?: $this->detectBrand($haystack, $product->source ?? null),
            'description' => $html,
            'tagline' => $this->tagline($product->tagline, $body),
            'story' => $this->isGeneratedStory($product->story) ? null : $product->story,
            'care' => $care,
            'materials' => $nonBody ? [] : $this->materials($haystack),
            // Значок «Body-safe» — только вручную, при наличии документов производителя.
            'is_body_safe' => false,
            // Выдуманные характеристики убираем — фильтры и шкалы показываются, только когда есть данные.
            'attributes' => [],
        ]);

        if ($unpublish) {
            $product->status = ProductStatus::Draft;
        }

        $product->save();

        // «Default Title» — служебное имя Shopify для единственного варианта (М2).
        $product->variants()->where('name', 'Default Title')->update(['name' => 'Standard']);

        $media = 0;
        foreach ($product->media as $i => $item) {
            $item->is_discreet_safe = false;
            $item->alt = $i === 0 ? $name : "{$name}, photo ".($i + 1);
            if ($item->isDirty()) {
                $item->save();
                $media++;
            }
        }

        return ['unpublished' => $unpublish, 'media' => $media];
    }

    public function cleanName(string $name): string
    {
        $name = preg_replace('/^\s*svakom\s*[-–—]?\s*/i', '', $name);
        $name = preg_replace('/\s+/', ' ', trim($name));

        // Единый регистр витрины: остальные названия — капсом.
        return mb_strtoupper($name);
    }

    public function cleanDescription(?string $html, string $originalName): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        // Ссылки из описаний не нужны совсем: в исходниках они вели в чужой магазин.
        $html = HtmlSanitizer::clean($html, allowLinks: false);
        if ($html === null) {
            return null;
        }

        // Блок FAQ («Frequently Asked Questions», «What is SVAKOM Tulip?») — до конца описания.
        $html = preg_replace('#<(h3|h4|p)>(?:<strong>)?\s*(frequently asked questions|faqs?)\b.*$#is', '', $html);

        // «Buy SVAKOM … Online Shop» и подобные хвосты чужого магазина.
        $html = preg_replace('#<(p|h3|h4|li)>[^<]*\b(buy\s+svakom|online\s+shop)\b.*?</\1>\s*#is', '', $html);

        // Абзац, состоящий только из жирного заголовка, — это подзаголовок.
        $html = preg_replace('#<p>\s*<strong>([^<]{3,140})</strong>\s*</p>#u', '<h4>$1</h4>', $html);

        // Эмодзи-нумерация «1️⃣».
        $html = preg_replace('/[0-9#*]\x{FE0F}?\x{20E3}\s*/u', '', $html);

        $html = strtr($html, self::TYPOS);
        $html = trim(preg_replace("/\n{2,}/", "\n", $html));

        // Описание, в котором остался только заголовок с названием товара, — пустое.
        $plain = trim(strip_tags($html));
        if ($plain === '' || mb_strlen($plain) < 40) {
            return null;
        }

        return $html;
    }

    protected function plain(?string $html): string
    {
        return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace('<', ' <', (string) $html)), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
    }

    protected function tagline(?string $current, string $text): ?string
    {
        // Старый импорт склеивал заголовок и первую фразу через перенос строки:
        // «The Hands-Free Upgrade…\n\nSome toys ask…» — на карточке они слипались (М15).
        // Вторую строку старый импорт ещё и резал на 90-м символе — её берём целиком из описания.
        if ($current !== null && preg_match('/\R/u', trim($current)) && ! preg_match('/svakom|online shop/i', $current)) {
            $lines = preg_split('/\R+/u', trim($current));
            $heading = trim(array_shift($lines));
            // Нет описания — оставляем исходную вторую строку как есть.
            $sentence = $this->tagline(null, $text) ?? implode(' ', $lines);
            $current = $this->joinLines($heading."\n".$sentence);
        }

        // Подзаголовки, которые обрезала сама чистка («…»), пересчитываем — вдруг текст исправлен.
        $generated = $current !== null && str_ends_with(trim($current), '…');

        if ($current !== null && ! $generated && ! in_array(trim($current), self::PLACEHOLDER_TAGLINES, true)
            && ! preg_match('/svakom|online shop/i', $current) && ! $this->looksTruncated($current)) {
            return strtr($current, self::TYPOS);
        }

        if ($text === '') {
            return null;
        }

        $text = preg_replace('/\s+/', ' ', strtr($text, self::TYPOS));
        $text = preg_replace('/\bSVAKOM\s+/i', '', $text);

        // Первое осмысленное предложение.
        foreach (preg_split('/(?<=[.!?])\s+/', $text) as $sentence) {
            $sentence = trim($sentence);
            // Списки совместимости («Charger compatibility: • Sam neo…») — не подзаголовок.
            if (mb_strlen($sentence) < 25 || str_contains($sentence, '•') || preg_match('/^[^.]{0,40}:\s/u', $sentence)) {
                continue;
            }

            return $this->clip($sentence, 120);
        }

        return null;
    }

    /** «Заголовок\n\nФраза» → «Заголовок. Фраза.» */
    protected function joinLines(string $text): string
    {
        $parts = array_values(array_filter(array_map(
            fn ($line) => rtrim(trim($line), ' .'),
            preg_split('/\R+/u', trim($text))
        ), fn ($line) => $line !== ''));

        $joined = str_replace(['?.', '!.'], ['?', '!'], implode('. ', $parts).'.');

        return $this->clip($joined, 160);
    }

    /** Обрезка по словам с многоточием — никаких «…frequency in the w». */
    protected function clip(string $text, int $limit): string
    {
        if (mb_strlen($text) <= $limit) {
            return rtrim($text);
        }

        $cut = mb_substr($text, 0, $limit);
        $cut = preg_replace('/\s+\S*$/u', '', $cut);

        return rtrim($cut, " ,;:—–-").'…';
    }

    /** Старый импорт резал по 90 символам посреди слова и без точки. */
    protected function looksTruncated(string $tagline): bool
    {
        $tagline = trim($tagline);

        return mb_strlen($tagline) >= 85 && ! preg_match('/[.!?…]$/u', $tagline);
    }

    protected function isGeneratedStory(?string $story): bool
    {
        return $story === null || str_starts_with(trim($story), 'Crafted from velvety');
    }

    /** @return array<int, string> */
    protected function materials(string $text): array
    {
        $found = [];
        foreach (self::MATERIALS as $label => $pattern) {
            if (preg_match($pattern, $text)) {
                $found[] = $label;
            }
        }

        return $found;
    }

    protected function detectBrand(string $text, ?string $source): ?string
    {
        return match (true) {
            (bool) preg_match('/kaotik/i', $text) => 'Kaotik Labs',
            (bool) preg_match('/svakom/i', $text) => 'SVAKOM',
            // Каталог без источника — выгрузка svakom.com (catalog:import).
            $source === null => 'SVAKOM',
            default => null,
        };
    }
}
