<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Карточка в каталоге. Тихий регистр: имя, намёк, цена «от», одно изображение.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cover = $this->media->first();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'priceFromCents' => $this->priceFromCents(),
            'currency' => $this->currency,
            'inStock' => $this->inStock(),
            'isBodySafe' => $this->is_body_safe,
            'cover' => $cover ? [
                'url' => $cover->url(),
                'alt' => $cover->alt,
                // Фронт решает, вешать ли blur, по этому флагу + скрытному режиму.
                'discreetSafe' => $cover->is_discreet_safe,
                'meta' => $cover->meta,
            ] : null,
        ];
    }
}
