<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // Webhook'и — без web-группы (см. комментарий в файле).
        then: fn () => Route::middleware([])->group(base_path('routes/webhooks.php')),
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: []);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // Age-gate — после Inertia, чтобы редирект корректно обрабатывался клиентом.
            EnsureAgeVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
