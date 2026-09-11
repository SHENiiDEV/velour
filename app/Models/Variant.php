<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Variant extends Model
{
    /** @use HasFactory<\Database\Factories\VariantFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'price_cents' => 'integer',
            'stock' => 'integer',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')->orderBy('position');
    }

    /** Цена варианта или, если не задана, цена товара. */
    public function priceCents(): int
    {
        return $this->price_cents ?? $this->product->price_cents;
    }

    public function isAvailable(int $qty = 1): bool
    {
        return $this->is_active && $this->stock >= $qty;
    }
}
