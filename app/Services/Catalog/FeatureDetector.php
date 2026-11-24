<?php

namespace App\Services\Catalog;

use App\Enums\AttributeType;
use App\Models\AttributeDefinition;

/**
 * Характеристики для фильтров — ТОЛЬКО из того, что написано в карточке товара
 * (название + описание производителя). Ничего не додумываем: если в тексте
 * не сказано «waterproof», товар не получает этот признак (а не получает «нет»).
 *
 * Пишется в products.attributes → ProductObserver синхронизирует product_attributes,
 * по которым работают фильтры каталога.
 */
class FeatureDetector
{
    /** Тип товара: первое совпадение по названию, затем по описанию. Порядок важен. */
    protected const KINDS = [
        'accessory' => '/\b(cable|charger|charging cable|cleaner|clean stuff|lubricant|storage bag|pouch|engraving|socks|tote|lanyard)\b/i',
        'ring' => '/\b(cock ring|penis ring|rings?)\b/i',
        'prostate' => '/\bprostate\b/i',
        'stroker' => '/\b(masturbat\w*|strokers?|sleeves?|jetpack|shotty)\b/i',
        'suction' => '/\b(suction|sucking|air[- ]pulse|licking|tongue)\b/i',
        'rabbit' => '/\brabbit\b/i',
        'wand' => '/\bwand\b/i',
        'egg' => '/\b(vibrating egg|love egg|bullet)\b/i',
        'wearable' => '/\b(wearable|panty|panties)\b/i',
        'vibrator' => '/\b(vibrator|massager)\b/i',
    ];

    /** Признаки «да», если они прямо названы в тексте. */
    protected const FEATURES = [
        'app_control' => '/\b(app[- ]controlled|app control|via (?:the )?app|(?:svakom|kaotik)[- ]?(?:connect\s)?app|bluetooth)\b/i',
        'waterproof' => '/\b(waterproof|IPX[67])\b/i',
        'rechargeable' => '/\b(rechargeable|usb[- ]?c?\s+charg\w*|magnetic charg\w*)\b/i',
        'hands_free' => '/\b(hands[- ]free|wearable)\b/i',
        'warming' => '/\b(heating|warming function|heats up|warms? up)\b/i',
        'couples' => '/\b(couples?|for two|with (?:your|a) partner|long[- ]distance)\b/i',
    ];

    /**
     * Словарь для фильтров. Подписи — коротко и по-взрослому.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function definitions(): array
    {
        return [
            [
                'key' => 'kind',
                'label' => 'Type',
                'type' => AttributeType::Enum,
                'options' => [
                    ['value' => 'vibrator', 'label' => 'Vibrator'],
                    ['value' => 'wand', 'label' => 'Wand'],
                    ['value' => 'rabbit', 'label' => 'Rabbit'],
                    ['value' => 'suction', 'label' => 'Air-pulse & suction'],
                    ['value' => 'wearable', 'label' => 'Wearable'],
                    ['value' => 'egg', 'label' => 'Bullet & egg'],
                    ['value' => 'stroker', 'label' => 'Stroker & sleeve'],
                    ['value' => 'ring', 'label' => 'Ring'],
                    ['value' => 'prostate', 'label' => 'Prostate'],
                    ['value' => 'accessory', 'label' => 'Accessory'],
                ],
                'position' => 1,
                'is_filterable' => true,
            ],
            ['key' => 'app_control', 'label' => 'App control', 'type' => AttributeType::Bool, 'position' => 2, 'is_filterable' => true],
            ['key' => 'couples', 'label' => 'For couples', 'type' => AttributeType::Bool, 'position' => 3, 'is_filterable' => true],
            ['key' => 'hands_free', 'label' => 'Hands-free', 'type' => AttributeType::Bool, 'position' => 4, 'is_filterable' => true],
            ['key' => 'waterproof', 'label' => 'Waterproof', 'type' => AttributeType::Bool, 'position' => 5, 'is_filterable' => true],
            ['key' => 'rechargeable', 'label' => 'Rechargeable', 'type' => AttributeType::Bool, 'position' => 6, 'is_filterable' => true],
            ['key' => 'warming', 'label' => 'Warming', 'type' => AttributeType::Bool, 'position' => 7, 'is_filterable' => true],
        ];
    }

    /** Создать/обновить словарь (идемпотентно — запускается из catalog-clean и сидера). */
    public static function ensureDefinitions(): void
    {
        foreach (self::definitions() as $definition) {
            AttributeDefinition::updateOrCreate(['key' => $definition['key']], $definition + [
                'scale' => null,
                'options' => null,
            ]);
        }
    }

    /**
     * @return array<string, string|bool>  например ['kind' => 'wand', 'waterproof' => true]
     */
    public function detect(string $name, string $text): array
    {
        $kind = $this->kind($name, $text);
        $attributes = $kind !== null ? ['kind' => $kind] : [];

        // У аксессуаров (кабели, чехлы) «charging» — не про сам товар.
        if ($kind === 'accessory') {
            return $attributes;
        }

        $haystack = $name.' '.$text;
        foreach (self::FEATURES as $key => $pattern) {
            if (preg_match($pattern, $haystack)) {
                $attributes[$key] = true;
            }
        }

        if ($kind === 'wearable') {
            $attributes['hands_free'] = true;
        }

        return $attributes;
    }

    protected function kind(string $name, string $text): ?string
    {
        foreach (['name' => $name, 'text' => $text] as $from => $source) {
            if (trim($source) === '') {
                continue;
            }
            foreach (self::KINDS as $kind => $pattern) {
                // «Аксессуар» — только по названию: в описании вибратора тоже бывает «charging cable».
                if ($kind === 'accessory' && $from === 'text') {
                    continue;
                }
                if (preg_match($pattern, $source)) {
                    return $kind;
                }
            }
        }

        return null;
    }
}
