<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Скрытный режим: cookie velour_discreet = 1|0.
 * Читается в HandleInertiaRequests и уходит во фронт как shared prop `discreet`.
 */
class DiscreetModeController extends Controller
{
    public const COOKIE = 'velour_discreet';

    public function toggle(Request $request): RedirectResponse
    {
        $data = $request->validate(['enabled' => ['required', 'boolean']]);

        return back()->withCookie(cookie(
            name: self::COOKIE,
            value: $data['enabled'] ? '1' : '0',
            minutes: 60 * 24 * 365,
            secure: $request->isSecure(),
            httpOnly: true,
            sameSite: 'lax',
        ));
    }

    public static function enabled(Request $request): bool
    {
        return $request->cookie(self::COOKIE) === '1';
    }
}
