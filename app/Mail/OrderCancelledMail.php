<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Письмо клиенту об отмене заказа. Тема нейтральная — её видно на экране блокировки.
 */
class OrderCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public bool $wasPaid = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your order {$this->order->number} has been cancelled",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-cancelled',
            with: [
                'order' => $this->order->loadMissing('items'),
                'wasPaid' => $this->wasPaid,
                'firstName' => trim(strtok((string) ($this->order->shipping_address['name'] ?? ''), ' ') ?: ''),
                'company' => config('velour.company'),
                'catalogUrl' => url('/catalog'),
            ],
        );
    }
}
