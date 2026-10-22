<?php

use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('welcome mail is queued after registration', function () {
    Mail::fake();

    $this->post('/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    Mail::assertQueued(WelcomeMail::class, fn (WelcomeMail $mail) => $mail->hasTo('ada@example.com'));
});

test('welcome mail renders with company details', function () {
    config(['velour.company.name' => 'Velour Test SIA']);

    $html = (new WelcomeMail(new User(['name' => 'Ada Lovelace'])))->render();

    expect($html)->toContain('Welcome, Ada.')->toContain('Velour Test SIA');
});
