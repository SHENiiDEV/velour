<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Models\Variant;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(protected CartService $carts) {}

    public function index(): Response
    {
        $cart = $this->carts->current();
        $cart?->load('items.variant.product.media');

        return Inertia::render('cart/index', [
            'cart' => $cart ? new CartResource($cart) : null,
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $variant = Variant::with('product')->findOrFail($request->integer('variant_id'));

        $this->carts->add($variant, $request->integer('qty', 1) ?: 1);

        return back()->with('status', 'Added to your cart.');
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): RedirectResponse
    {
        $this->assertOwnership($item);

        $this->carts->updateQty($item, $request->integer('qty'));

        return back();
    }

    public function destroy(CartItem $item): RedirectResponse
    {
        $this->assertOwnership($item);

        $this->carts->remove($item);

        return back();
    }

    /** Позиция должна принадлежать корзине текущего посетителя — иначе 404. */
    protected function assertOwnership(CartItem $item): void
    {
        abort_unless($this->carts->current()?->is($item->cart), 404);
    }
}
