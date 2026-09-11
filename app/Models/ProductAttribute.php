<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Плоский индекс products.attributes — только для фильтров. Пишет ProductObserver. */
class ProductAttribute extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['value_numeric' => 'float'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
