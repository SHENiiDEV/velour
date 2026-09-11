<?php

use App\Http\Controllers\DiscreetModeController;
use App\Http\Middleware\EnsureAgeVerified;

it('redirects unverified guests to the age gate', function () {
    $this->get('/')->assertRedirect(route('age.show'));
});

it('lets legal and care pages through without verification', function () {
    $this->get('/privacy')->assertOk();
    $this->get('/care')->assertOk();
    $this->get('/journal')->assertRedirect(route('age.show'));
});

it('sets an encrypted cookie on confirm and returns to the intended page', function () {
    $this->get('/');

    $this->post('/age', ['confirm' => '1'])
        ->assertRedirect('/')
        ->assertCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE);
});

it('serves the home page to verified visitors', function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE)
        ->get('/')
        ->assertOk();
});

it('cannot be fooled by an unencrypted cookie', function () {
    $this->withUnencryptedCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE)
        ->get('/')
        ->assertRedirect(route('age.show'));
});

it('toggles discreet mode', function () {
    $this->withCookie(EnsureAgeVerified::COOKIE, EnsureAgeVerified::VALUE)
        ->from('/')
        ->post('/discreet', ['enabled' => true])
        ->assertRedirect('/')
        ->assertCookie(DiscreetModeController::COOKIE, '1');
});
