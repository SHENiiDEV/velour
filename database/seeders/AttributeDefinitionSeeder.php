<?php

namespace Database\Seeders;

use App\Enums\AttributeType;
use App\Models\AttributeDefinition;
use Illuminate\Database\Seeder;

/**
 * Сенсорный словарь. Формулировки — взрослые и точные, без клиники
 * и без пошлости: описываем ощущение материала, а не сцену.
 */
class AttributeDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = [
            [
                'key' => 'firmness',
                'label' => 'Firmness',
                'type' => AttributeType::Scale,
                'scale' => ['min' => 1, 'max' => 5, 'labels' => [
                    '1' => 'soft', '2' => 'yielding', '3' => 'medium', '4' => 'firm', '5' => 'hard',
                ]],
                'position' => 10,
            ],
            [
                'key' => 'texture',
                'label' => 'Surface',
                'type' => AttributeType::Enum,
                'options' => [
                    ['value' => 'silk', 'label' => 'smooth'],
                    ['value' => 'matte', 'label' => 'matte'],
                    ['value' => 'ribbed', 'label' => 'ribbed'],
                    ['value' => 'polished', 'label' => 'polished'],
                ],
                'position' => 20,
            ],
            [
                'key' => 'weight',
                'label' => 'Weight in hand',
                'type' => AttributeType::Scale,
                'scale' => ['min' => 1, 'max' => 5, 'labels' => [
                    '1' => 'weightless', '2' => 'light', '3' => 'noticeable', '4' => 'substantial', '5' => 'heavy',
                ]],
                'position' => 30,
            ],
            [
                'key' => 'noise',
                'label' => 'Quiet',
                'type' => AttributeType::Scale,
                'scale' => ['min' => 1, 'max' => 5, 'labels' => [
                    '1' => 'silent', '2' => 'barely audible', '3' => 'audible up close', '4' => 'heard in the room', '5' => 'noticeable',
                ]],
                'position' => 40,
            ],
            [
                'key' => 'temperature',
                'label' => 'Temperature',
                'type' => AttributeType::Enum,
                'options' => [
                    ['value' => 'holds-cool', 'label' => 'holds the cold'],
                    ['value' => 'body-warm', 'label' => 'warms quickly'],
                    ['value' => 'neutral', 'label' => 'neutral'],
                ],
                'position' => 50,
            ],
            [
                'key' => 'waterproof',
                'label' => 'Waterproof',
                'type' => AttributeType::Bool,
                'position' => 60,
            ],
            [
                'key' => 'lube_safe',
                'label' => 'Silicone lube safe',
                'type' => AttributeType::Bool,
                'is_filterable' => false,
                'position' => 70,
            ],
        ];

        foreach ($definitions as $definition) {
            AttributeDefinition::updateOrCreate(['key' => $definition['key']], $definition);
        }
    }
}
