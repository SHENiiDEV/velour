<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation — {{ $order->number }} | VELOUR</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #100a0c;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #ece3d6;
            -webkit-font-smoothing: antialiased;
        }
        table {
            border-collapse: collapse;
        }
        .wrapper {
            width: 100%;
            background-color: #100a0c;
            padding: 40px 15px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1216;
            border: 1px solid rgba(198, 161, 91, 0.25);
            border-radius: 4px;
            overflow: hidden;
        }
        .header {
            padding: 35px 35px 25px;
            text-align: center;
            border-bottom: 1px solid rgba(236, 227, 214, 0.08);
            background: linear-gradient(180deg, rgba(78, 18, 36, 0.3) 0%, rgba(26, 18, 22, 0.8) 100%);
        }
        .brand {
            font-size: 28px;
            letter-spacing: 5px;
            color: #ece3d6;
            text-transform: uppercase;
            font-weight: 300;
        }
        .tagline {
            font-size: 10px;
            letter-spacing: 2px;
            color: #c6a15b;
            text-transform: uppercase;
            margin-top: 6px;
        }
        .content {
            padding: 35px;
        }
        .heading {
            font-size: 24px;
            font-weight: 300;
            color: #ece3d6;
            margin: 0 0 12px;
        }
        .lead {
            font-size: 14px;
            line-height: 1.6;
            color: #9e8e88;
            margin: 0 0 25px;
        }
        .order-badge {
            display: inline-block;
            background-color: rgba(198, 161, 91, 0.12);
            border: 1px solid rgba(198, 161, 91, 0.3);
            color: #c6a15b;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 20px;
        }
        .card {
            background-color: #120c0f;
            border: 1px solid rgba(236, 227, 214, 0.06);
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .card-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #c6a15b;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .item-table {
            width: 100%;
            margin-bottom: 15px;
        }
        .item-table td {
            padding: 10px 0;
            border-bottom: 1px solid rgba(236, 227, 214, 0.06);
            font-size: 13px;
        }
        .item-name {
            color: #ece3d6;
            font-weight: 500;
        }
        .item-variant {
            font-size: 11px;
            color: #9e8e88;
            margin-top: 2px;
        }
        .item-price {
            text-align: right;
            color: #c6a15b;
            font-weight: 500;
            white-space: nowrap;
        }
        .totals-row td {
            padding: 6px 0;
            font-size: 13px;
            color: #9e8e88;
        }
        .grand-total td {
            padding-top: 12px;
            border-top: 1px solid rgba(198, 161, 91, 0.25);
            font-size: 16px;
            color: #c6a15b;
            font-weight: bold;
        }
        .discretion-box {
            background-color: rgba(78, 18, 36, 0.2);
            border-left: 2px solid #c6a15b;
            padding: 15px;
            margin-bottom: 25px;
        }
        .discretion-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #c6a15b;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .discretion-desc {
            font-size: 12px;
            color: #9e8e88;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            background-color: #c6a15b;
            color: #100a0c !important;
            text-decoration: none;
            padding: 14px 30px;
            font-size: 13px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-weight: bold;
            border-radius: 2px;
            margin: 15px 0 25px;
        }
        .footer {
            padding: 25px 35px;
            border-top: 1px solid rgba(236, 227, 214, 0.08);
            text-align: center;
            font-size: 11px;
            color: #736762;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="container" align="center" width="100%" cellpadding="0" cellspacing="0">
            <!-- Header -->
            <tr>
                <td class="header">
                    <div class="brand">VELOUR</div>
                    <div class="tagline">Atelier of Sensations</div>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td class="content">
                    <div class="order-badge">Passage Confirmed</div>
                    <h1 class="heading">Your selection is quietly preparing.</h1>
                    <p class="lead">
                        Thank you for your order. We have received your request, and your creations are being prepared in our private workshop for discreet passage.
                    </p>

                    <!-- Order Summary -->
                    <div class="card">
                        <div class="card-title">Order #{{ $order->number }}</div>

                        <table class="item-table" width="100%">
                            @foreach($order->items as $item)
                                <tr>
                                    <td>
                                        <div class="item-name">{{ $item->product_name_snapshot }}</div>
                                        <div class="item-variant">{{ $item->variant_name_snapshot }} × {{ $item->qty }}</div>
                                    </td>
                                    <td class="item-price">
                                        {{ number_format($item->total_cents / 100, 2) }} {{ $order->currency }}
                                    </td>
                                </tr>
                            @endforeach
                        </table>

                        <table width="100%" class="totals-row">
                            <tr>
                                <td>Subtotal</td>
                                <td align="right" style="color: #ece3d6;">{{ number_format($order->subtotal_cents / 100, 2) }} {{ $order->currency }}</td>
                            </tr>
                            <tr>
                                <td>Discreet Shipping</td>
                                <td align="right" style="color: #ece3d6;">
                                    @if($order->shipping_cents === 0)
                                        <span style="color: #c6a15b;">Complimentary</span>
                                    @else
                                        {{ number_format($order->shipping_cents / 100, 2) }} {{ $order->currency }}
                                    @endif
                                </td>
                            </tr>
                            <tr class="grand-total">
                                <td>Total Amount</td>
                                <td align="right">{{ number_format($order->total_cents / 100, 2) }} {{ $order->currency }}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Destination -->
                    <div class="card">
                        <div class="card-title">Destination & Delivery</div>
                        <div style="font-size: 13px; color: #ece3d6; line-height: 1.5;">
                            <strong>{{ $order->shipping_address['name'] ?? 'Private Client' }}</strong><br>
                            {{ $order->shipping_address['line1'] ?? '' }}<br>
                            @if(!empty($order->shipping_address['line2']))
                                {{ $order->shipping_address['line2'] }}<br>
                            @endif
                            {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['postcode'] ?? '' }}<br>
                            {{ $order->shipping_address['country'] ?? '' }}
                        </div>
                    </div>

                    <!-- Discretion Protocol -->
                    <div class="discretion-box">
                        <div class="discretion-title">Guaranteed Discreet Packaging</div>
                        <div class="discretion-desc">
                            Your order will arrive in a plain, unmarked box with a neutral sender name. Bank charges will appear simply as <strong>{{ $order->statement_descriptor }}</strong>.
                        </div>
                    </div>

                    <p style="font-size: 12px; color: #9e8e88; margin-top: 15px;">
                        📎 A formal dark-styled PDF receipt/invoice has been attached to this email for your personal records.
                    </p>

                    <center>
                        <a href="{{ url('/order/' . $order->number . '/invoice') }}" class="button">
                            Download PDF Invoice
                        </a>
                    </center>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer">
                    VELOUR · Confidential Dispatch Atelier<br>
                    Questions? Contact us discreetly at <a href="mailto:info@velour-retail.com" style="color: #c6a15b; text-decoration: none;">info@velour-retail.com</a><br>
                    <span style="font-size: 10px; color: #574c48; margin-top: 6px; display: block;">
                        No promotional emails will be sent unless explicitly requested.
                    </span>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
