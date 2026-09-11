<?php

namespace App\Observers;

use App\Models\Product;

/** Держит product_attributes в синхроне с products.attributes (json). */
class ProductObserver
{
    public function saved(Product $product): void
    {
        if (! $product->wasChanged('attributes') && ! $product->wasRecentlyCreated) {
            return;
        }

        $values = $product->sensory();

        $product->attributeValues()->whereNotIn('key', array_keys($values))->delete();

        foreach ($values as $key => $value) {
            $product->attributeValues()->updateOrCreate(
                ['key' => $key],
                [
                    // bool → 1/0, чтобы фильтр ?waterproof=1 работал числом.
                    'value_numeric' => is_bool($value) ? (float) $value : (is_numeric($value) ? (float) $value : null),
                    'value_text' => is_bool($value) || is_numeric($value) ? null : (string) $value,
                ],
            );
        }
    }
}
