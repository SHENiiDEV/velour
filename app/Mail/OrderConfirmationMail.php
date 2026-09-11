<?php

namespace App\Mail;

use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order Confirmation #{$this->order->number} — VELOUR",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'order' => $this->order->loadMissing('items'),
            ],
        );
    }

    public function attachments(): array
    {
        $invoiceService = app(InvoiceService::class);
        $pdfData = $invoiceService->output($this->order);

        return [
            Attachment::fromData(fn () => $pdfData, "invoice-VELOUR-{$this->order->number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
