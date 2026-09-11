<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class InvoiceService
{
    /**
     * Создает DOMPDF объект с темным стилем Velour.
     */
    public function render(Order $order)
    {
        $order->loadMissing('items');

        return Pdf::loadView('pdf.invoice', [
            'order' => $order,
        ])
        ->setPaper('a4', 'portrait')
        ->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'DejaVu Sans',
        ]);
    }

    /**
     * Возвращает сырой контент PDF файла для вложения в письмо.
     */
    public function output(Order $order): string
    {
        return $this->render($order)->output();
    }

    /**
     * Возвращает HTTP Response для скачивания PDF клиентом.
     */
    public function download(Order $order): Response
    {
        $filename = "invoice-VELOUR-{$order->number}.pdf";

        return $this->render($order)->download($filename);
    }
}
