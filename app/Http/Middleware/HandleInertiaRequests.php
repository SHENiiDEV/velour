<?php

namespace App\Http\Middleware;

use App\Http\Controllers\DiscreetModeController;
use App\Models\Category;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props — единственный канал данных во фронт.
     * Типы: resources/js/types/velour.d.ts (SharedProps).
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'privacy' => [
                'discreet' => DiscreetModeController::enabled($request),
                'ageVerified' => EnsureAgeVerified::isVerified($request),
                'exitUrl' => config('velour.exit_url'),
            ],
            'company' => config('velour.company'),
            // Условия доставки и пометка НДС — одна точка правды для карточки, корзины и страницы Delivery.
            'shop' => [
                'currency' => config('velour.currency'),
                'shippingFlatCents' => (int) config('velour.shipping.flat_cents'),
                'freeShippingFromCents' => (int) config('velour.shipping.free_from_cents'),
                'vatNote' => config('velour.vat_note'),
                'dispatchDays' => config('velour.shipping.dispatch_days'),
                'countries' => config('velour.shipping.countries'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            // Разделы для мобильного меню — те же и в том же порядке, что в каталоге (М8), без пустых.
            'navCategories' => fn () => Category::visible()
                ->whereHas('products', fn ($q) => $q->live())
                ->orderBy('position')
                ->get(['slug', 'name']),
            // Счётчик для шапки. Замыкание — считается только когда фронт его просит.
            'cartCount' => fn () => app(CartService::class)->current()?->itemCount() ?? 0,
        ];
    }
}
