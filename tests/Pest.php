<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Models\Cart;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->extend(Tests\TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/**
 * Тестовый клиент не переотправляет cookie из ответа автоматически.
 * Корзина у нас живёт на cookie — поэтому после первого добавления
 * подкладываем токен вручную, имитируя того же посетителя.
 */
function keepCart($test): Cart
{
    $cart = Cart::firstOrFail();

    $test->withCookie(CartService::COOKIE, $cart->token);

    return $cart;
}

/** Посетитель, подтвердивший возраст. */
function verifiedAge($test): void
{
    $test->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
}
