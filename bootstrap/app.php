<?php

use App\Http\Middleware\EnsureAgeVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

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
        // HSTS + CSP на всех ответах, включая страницы ошибок (М10).
        $middleware->append(SecurityHeaders::class);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // Age-gate — после Inertia, чтобы редирект корректно обрабатывался клиентом.
            EnsureAgeVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                if ($request->header('X-Inertia') || ! app()->environment(['local', 'testing'])) {
                    // На «не найденном» маршруте web-middleware не отрабатывает, и общих
                    // props (company, privacy…) нет — без них layout падал в чёрный экран.
                    $fallback = Inertia::getShared('company') === null ? [
                        'name' => config('app.name'),
                        'auth' => ['user' => null],
                        'company' => config('velour.company'),
                        'privacy' => [
                            'discreet' => false,
                            'ageVerified' => false,
                            'exitUrl' => config('velour.exit_url'),
                        ],
                        'flash' => ['status' => null],
                        'cartCount' => 0,
                        'shop' => \App\Support\Shipping::shared(),
                    ] : [];

                    return Inertia::render('error', [
                        ...$fallback,
                        'status' => $response->getStatusCode(),
                    ])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
                }
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })->create();
