<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * HSTS и базовая Content-Security-Policy (аудит, М10).
 * Включается в production; выключить — VELOUR_CSP=false.
 * При подключении платёжного провайдера добавь его домены в VELOUR_CSP_EXTRA
 * (например: "frame-src https://pay.example.com; form-action 'self' https://pay.example.com").
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! app()->environment('production')) {
            return $response;
        }

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        if (config('velour.security.csp') && ! $response->headers->has('Content-Security-Policy')) {
            $policy = implode('; ', array_filter([
                "default-src 'self'",
                "script-src 'self'",
                // React пишет инлайновые style="" — без 'unsafe-inline' сломается вёрстка.
                "style-src 'self' 'unsafe-inline'",
                // cdn.shopify.com — пока фото не перенесены командой velour:media-localize.
                "img-src 'self' data: blob: https://cdn.shopify.com",
                "font-src 'self' data:",
                "media-src 'self' blob:",
                "connect-src 'self'",
                "worker-src 'self' blob:",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
                config('velour.security.csp_extra'),
            ]));

            $response->headers->set('Content-Security-Policy', $policy);
        }

        return $response;
    }
}
