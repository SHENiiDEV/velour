<?php

namespace App\Http\Middleware;

use App\Http\Controllers\DiscreetModeController;
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
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            // Счётчик для шапки. Замыкание — считается только когда фронт его просит.
            'cartCount' => fn () => app(CartService::class)->current()?->itemCount() ?? 0,
        ];
    }
}
