<?php

use App\Http\Controllers\AgeGateController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DiscreetModeController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');

// 18+
Route::get('/age', [AgeGateController::class, 'show'])->name('age.show');
Route::post('/age', [AgeGateController::class, 'confirm'])->name('age.confirm');
Route::post('/age/decline', [AgeGateController::class, 'decline'])->name('age.decline');

// Скрытный режим
Route::post('/discreet', [DiscreetModeController::class, 'toggle'])->name('discreet.toggle');

// Каталог
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/catalog/{category:slug}', [CatalogController::class, 'index'])->name('catalog.category');
Route::get('/p/{product:slug}', [CatalogController::class, 'show'])->name('product.show');

// Корзина
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{item}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{item}', [CartController::class, 'destroy'])->name('cart.destroy');

// Оформление & Инвойсы
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/{order:number}/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/order/{order:number}/invoice', [CheckoutController::class, 'invoice'])->name('order.invoice');

// Редакция
Route::get('/journal', fn () => Inertia::render('journal'))->name('journal');

// Доступны без age-gate: юридические страницы и «Забота» (образование, не витрина)
Route::get('/care', fn () => Inertia::render('care'))->name('care');
Route::get('/privacy', fn () => Inertia::render('legal/privacy'))->name('legal.privacy');
Route::get('/terms', fn () => Inertia::render('legal/terms'))->name('legal.terms');

// Dashboard
Route::get('/dashboard', fn () => Inertia::render('dashboard'))->middleware(['auth', 'verified'])->name('dashboard');

// Стартер-кит: auth/settings — оставляем, если нужны.
if (file_exists(__DIR__.'/settings.php')) {
    require __DIR__.'/settings.php';
}
if (file_exists(__DIR__.'/auth.php')) {
    require __DIR__.'/auth.php';
}
