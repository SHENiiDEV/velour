<?php

namespace App\Http\Resources;

use App\Models\AttributeDefinition;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Страница товара: материалы, уход и сенсорные характеристики с человеческими
 * подписями — честность про материалы здесь часть продукта, а не мелкий шрифт.
 *
 * @mixin Product
 */
class ProductDetailResource extends JsonResource
{
    public static $wrap = null;

    /** @param  \Illuminate\Support\Collection<string, AttributeDefinition>  $definitions */
    public function __construct($resource, protected $definitions)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'story' => $this->story,
            'care' => $this->care,
            'materials' => $this->materials ?? [],
            'isBodySafe' => $this->is_body_safe,
            'brand' => $this->brand,
            'currency' => $this->currency,
            'priceFromCents' => $this->priceFromCents(),
            'category' => [
                'slug' => $this->category->slug,
                'name' => $this->category->name,
            ],
            'sensory' => $this->sensoryPayload(),
            'variants' => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'name' => $variant->name,
                'options' => $variant->options,
                'priceCents' => $variant->priceCents(),
                'inStock' => $variant->stock > 0,
                'isDefault' => $variant->is_default,
            ])->values(),
            'media' => $this->media->map(fn ($media) => [
                'url' => $media->url(),
                'alt' => $media->alt,
                'kind' => $media->kind->value,
                'discreetSafe' => $media->is_discreet_safe,
                'meta' => $media->meta,
            ])->values(),
        ];
    }

    /** @return array<int, array{key:string,label:string,value:mixed,valueLabel:?string,scale:?array}> */
    protected function sensoryPayload(): array
    {
        $out = [];

        foreach ($this->sensory() as $key => $value) {
            /** @var AttributeDefinition|null $definition */
            $definition = $this->definitions[$key] ?? null;

            $out[] = [
                'key' => $key,
                'label' => $definition?->label ?? $key,
                'value' => $value,
                'valueLabel' => $definition?->labelFor($value),
                'scale' => $definition?->scale,
            ];
        }

        return $out;
    }
}
