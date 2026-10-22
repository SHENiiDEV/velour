<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Приветственное письмо после регистрации.
 * Тема нейтральная: письмо может всплыть в превью на экране блокировки.
 */
class WelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to '.config('app.name', 'VELOUR'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'firstName' => trim(strtok($this->user->name ?? '', ' ') ?: ''),
                'company' => config('velour.company'),
                'descriptor' => config('velour.statement_descriptor'),
                'catalogUrl' => url('/catalog'),
                'accountUrl' => url('/dashboard'),
            ],
        );
    }
}
