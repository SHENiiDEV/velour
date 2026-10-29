<?php

use App\Http\Middleware\EnsureAgeVerified;

it('serves delivery, returns, cookies and legal notice without the age gate', function (string $url) {
    $this->get($url)->assertOk();
})->with(['/delivery', '/returns', '/cookies', '/legal-notice', '/privacy', '/terms']);

it('gives every journal essay its own address', function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE)
        ->get('/journal/geometry-of-goosebumps')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('journal')->where('essay', 'geometry-of-goosebumps'));

    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE)
        ->get('/journal/does-not-exist')
        ->assertNotFound();
});

it('states the governing law and the merchant on the terms page', function () {
    config(['velour.company.name' => 'CALDORIS VENTURES LTD', 'velour.company.trading_name' => 'VELOUR']);

    $this->get('/terms')->assertInertia(fn ($page) => $page
        ->component('legal/terms')
        ->where('governingLaw', 'England and Wales')
        ->where('company.name', 'CALDORIS VENTURES LTD')
        ->where('company.trading_name', 'VELOUR')
        ->where('company.country', 'United Kingdom'));
});
