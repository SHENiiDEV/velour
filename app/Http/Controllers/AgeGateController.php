<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureAgeVerified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgeGateController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if (EnsureAgeVerified::isVerified($request)) {
            return redirect()->route('home');
        }

        return Inertia::render('age-gate', [
            'exitUrl' => config('velour.exit_url'),
        ]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);

        $intended = $request->session()->pull('age.intended', route('home'));

        return redirect()
            ->to($intended)
            ->withCookie(cookie(
                name: EnsureAgeVerified::COOKIE,
                value: EnsureAgeVerified::VALUE,
                minutes: EnsureAgeVerified::TTL_DAYS * 24 * 60,
                secure: $request->isSecure(),
                httpOnly: true,
                sameSite: 'lax',
            ));
    }

    /** Пользователь отказался — ничего не ставим, уводим на нейтральный сайт. */
    public function decline(): RedirectResponse
    {
        return redirect()->away(config('velour.exit_url'));
    }
}
