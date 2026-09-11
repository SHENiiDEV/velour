<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Age-gate: пропускает только при наличии зашифрованной cookie.
 * Cookie ставит AgeGateController@confirm. Шифруется штатным EncryptCookies —
 * подделать значение на клиенте нельзя.
 */
class EnsureAgeVerified
{
    public const COOKIE = 'velour_age';

    public const VALUE = 'verified';

    /** Дней жизни cookie. */
    public const TTL_DAYS = 365;

    /** Маршруты, доступные без подтверждения возраста. */
    protected array $except = [
        'age.show',
        'age.confirm',
        'legal.privacy',
        'legal.terms',
        'care',
        'error.404',
        'error.503',
        'up',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isVerified($request) || $this->isExcluded($request)) {
            return $next($request);
        }

        // Запоминаем, куда вернуть после подтверждения.
        if ($request->isMethod('GET') && ! $request->expectsJson()) {
            $request->session()->put('age.intended', $request->fullUrl());
        }

        return redirect()->route('age.show');
    }

    public static function isVerified(Request $request): bool
    {
        return $request->cookie(self::COOKIE) === self::VALUE;
    }

    protected function isExcluded(Request $request): bool
    {
        if ($request->user() !== null) {
            return true;
        }

        $name = $request->route()?->getName();
        if ($name !== null) {
            if (in_array($name, $this->except, true)) {
                return true;
            }
            if (
                str_starts_with($name, 'login') ||
                str_starts_with($name, 'register') ||
                str_starts_with($name, 'password.') ||
                str_starts_with($name, 'verification.') ||
                str_starts_with($name, 'settings.') ||
                str_starts_with($name, 'dashboard') ||
                str_starts_with($name, 'logout') ||
                str_starts_with($name, 'error.')
            ) {
                return true;
            }
        }

        return $request->is('settings/*', 'dashboard', 'login', 'register', 'forgot-password', 'reset-password/*', 'verify-email/*', 'error/*');
    }
}
