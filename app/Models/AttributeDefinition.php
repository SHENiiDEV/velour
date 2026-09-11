<?php

namespace App\Models;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttributeDefinition extends Model
{
    /** @use HasFactory<\Database\Factories\AttributeDefinitionFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'type' => AttributeType::class,
            'scale' => 'array',
            'options' => 'array',
            'is_filterable' => 'boolean',
        ];
    }

    /** Подпись значения на шкале: 3 → «в меру». */
    public function labelFor(int|string|bool|null $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($this->type) {
            AttributeType::Scale => $this->scale['labels'][(string) $value] ?? (string) $value,
            AttributeType::Enum => collect($this->options ?? [])->firstWhere('value', $value)['label'] ?? (string) $value,
            AttributeType::Bool => $value ? 'yes' : 'no',
        };
    }
}
