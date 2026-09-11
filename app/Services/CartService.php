<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

/**
 * Корзина живёт на cookie-токене — регистрация не нужна (это часть приватности,
 * а не удобство). При логине гостевая корзина сливается с корзиной пользователя.
 */
class CartService
{
    public const COOKIE = 'velour_cart';

    public const TTL_DAYS = 30;

    public function __construct(protected ?Request $request = null) {}

    protected function getRequest(): Request
    {
        return $this->request ?? request();
    }

    /** Текущая корзина без создания записи в БД (для чтения). */
    public function current(): ?Cart
    {
        $user = $this->getRequest()->user();

        if ($user) {
            return Cart::with('items.variant.product')->firstWhere('user_id', $user->id)
                ?? $this->byToken();
        }

        return $this->byToken();
    }

    /** Текущая корзина, создавая при необходимости. */
    public function currentOrCreate(): Cart
    {
        $cart = $this->current();

        if ($cart) {
            return $cart;
        }

        $request = $this->getRequest();
        $cart = Cart::create([
            'user_id' => $request->user()?->id,
            'currency' => config('velour.currency'),
        ]);

        // Ставим cookie в очередь — уйдёт с ближайшим ответом.
        Cookie::queue(Cookie::make(
            name: self::COOKIE,
            value: $cart->token,
            minutes: self::TTL_DAYS * 24 * 60,
            secure: $request->isSecure(),
            httpOnly: true,
            sameSite: 'lax',
        ));

        return $cart;
    }

    public function add(Variant $variant, int $qty = 1): CartItem
    {
        abort_unless($variant->isAvailable($qty), 422, 'That item is not in stock in the quantity you want.');

        $cart = $this->currentOrCreate();

        $item = $cart->items()->firstOrNew(['variant_id' => $variant->id]);
        $newQty = ($item->qty ?? 0) + $qty;

        abort_unless($variant->isAvailable($newQty), 422, 'There is less in stock than you are asking for.');

        $item->fill([
            'qty' => $newQty,
            'unit_price_cents' => $variant->priceCents(),
        ])->save();

        return $item;
    }

    public function updateQty(CartItem $item, int $qty): void
    {
        if ($qty <= 0) {
            $item->delete();

            return;
        }

        abort_unless($item->variant->isAvailable($qty), 422, 'There is less in stock than you are asking for.');

        $item->update(['qty' => $qty]);
    }

    public function remove(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * Слияние гостевой корзины с пользовательской после логина.
     * Вызывать из слушателя события Login.
     */
    public function mergeGuestCartInto(int $userId): void
    {
        $guest = $this->byToken();

        if (! $guest || $guest->user_id === $userId) {
            $guest?->update(['user_id' => $userId]);

            return;
        }

        $target = Cart::firstOrCreate(['user_id' => $userId], ['currency' => config('velour.currency')]);

        DB::transaction(function () use ($guest, $target) {
            foreach ($guest->items as $item) {
                $existing = $target->items()->firstOrNew(['variant_id' => $item->variant_id]);
                $existing->fill([
                    'qty' => ($existing->qty ?? 0) + $item->qty,
                    'unit_price_cents' => $item->unit_price_cents,
                ])->save();
            }

            $guest->items()->delete();
            $guest->delete();
        });

        Cookie::queue(Cookie::forget(self::COOKIE));
    }

    protected function byToken(): ?Cart
    {
        $request = $this->getRequest();
        $token = $request->cookie(self::COOKIE) ?? Cookie::get(self::COOKIE);

        return $token ? Cart::with('items.variant.product')->firstWhere('token', $token) : null;
    }
}
