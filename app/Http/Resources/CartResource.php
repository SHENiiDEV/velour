<?php

namespace App\Http\Resources;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Cart */
class CartResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        $subtotal = $this->subtotalCents();
        $freeFrom = (int) config('velour.shipping.free_from_cents');
        $shipping = $subtotal >= $freeFrom ? 0 : (int) config('velour.shipping.flat_cents');

        return [
            'currency' => $this->currency,
            'itemCount' => $this->itemCount(),
            'subtotalCents' => $subtotal,
            'shippingCents' => $shipping,
            'totalCents' => $subtotal + $shipping,
            'freeShippingFromCents' => $freeFrom,
            'items' => $this->items->map(function ($item) {
                $product = $item->variant->product;
                $cover = $product->media->first();

                return [
                    'id' => $item->id,
                    'qty' => $item->qty,
                    'unitPriceCents' => $item->unit_price_cents,
                    'totalCents' => $item->totalCents(),
                    'maxQty' => $item->variant->stock,
                    'variant' => [
                        'id' => $item->variant->id,
                        'name' => $item->variant->name,
                        'sku' => $item->variant->sku,
                    ],
                    'product' => [
                        'slug' => $product->slug,
                        'name' => $product->name,
                        'cover' => $cover ? [
                            'url' => $cover->url(),
                            'alt' => $cover->alt,
                            'discreetSafe' => $cover->is_discreet_safe,
                        ] : null,
                    ],
                ];
            })->values(),
        ];
    }
}
