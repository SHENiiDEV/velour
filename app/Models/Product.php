<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'materials' => 'array',
            'attributes' => 'array',
            'price_cents' => 'integer',
            'is_body_safe' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(Variant::class)->orderByDesc('is_default')->orderBy('id');
    }

    public function activeVariants(): HasMany
    {
        return $this->variants()->where('is_active', true);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('position');
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttribute::class);
    }

    /** Опубликованные и доступные к покупке. */
    public function scopeLive(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::Live)
            ->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    /**
     * Фильтр по сенсорной характеристике: ?firmness[]=1&firmness[]=2 (шкала)
     * или ?texture=silk (enum).
     *
     * @param  array<int, string|int>|string|int  $values
     */
    public function scopeWithAttribute(Builder $query, string $key, array|string|int $values): Builder
    {
        $values = is_array($values) ? $values : [$values];

        return $query->whereHas('attributeValues', function (Builder $q) use ($key, $values) {
            $q->where('key', $key)->where(function (Builder $inner) use ($values) {
                $numeric = array_values(array_filter($values, 'is_numeric'));
                $text = array_values(array_filter($values, fn ($v) => ! is_numeric($v)));

                if ($numeric !== []) {
                    $inner->orWhereIn('value_numeric', $numeric);
                }
                if ($text !== []) {
                    $inner->orWhereIn('value_text', $text);
                }
            });
        });
    }

    /**
     * ВАЖНО: колонка называется `attributes` (так в инструкциях проекта), а у Eloquent
     * есть protected-свойство с тем же именем. Снаружи `$product->attributes` работает
     * через __get, но ВНУТРИ класса `$this->attributes` — это внутренний массив модели.
     * Поэтому в коде всегда обращаемся через этот аксессор.
     *
     * @return array<string, int|string|bool>
     */
    public function sensory(): array
    {
        return $this->getAttribute('attributes') ?? [];
    }

    /** Минимальная цена среди активных вариантов (иначе — витринная). */
    public function priceFromCents(): int
    {
        $variantPrices = $this->relationLoaded('variants')
            ? $this->variants->where('is_active', true)->pluck('price_cents')->filter()->all()
            : [];

        return $variantPrices === [] ? $this->price_cents : min(min($variantPrices), $this->price_cents);
    }

    public function inStock(): bool
    {
        return $this->relationLoaded('variants')
            ? $this->variants->where('is_active', true)->sum('stock') > 0
            : $this->activeVariants()->sum('stock') > 0;
    }
}
