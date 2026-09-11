<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ $order->number }} — VELOUR</title>
    <style>
        @page {
            margin: 0;
            background-color: #100a0c;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            background-color: #100a0c;
            color: #ece3d6;
            margin: 0;
            padding: 45px 50px;
            font-size: 13px;
            line-height: 1.5;
        }
        .header {
            width: 100%;
            border-bottom: 1px solid rgba(198, 161, 91, 0.3);
            padding-bottom: 25px;
            margin-bottom: 30px;
        }
        .brand {
            font-size: 26px;
            font-weight: 300;
            letter-spacing: 4px;
            color: #ece3d6;
            text-transform: uppercase;
        }
        .brand-sub {
            font-size: 9px;
            letter-spacing: 2px;
            color: #c6a15b;
            text-transform: uppercase;
            margin-top: 4px;
        }
        .doc-title {
            text-align: right;
            font-size: 20px;
            font-weight: 300;
            letter-spacing: 2px;
            color: #c6a15b;
            text-transform: uppercase;
        }
        .doc-meta {
            text-align: right;
            font-size: 11px;
            color: #9e8e88;
            margin-top: 4px;
        }
        .meta-grid {
            width: 100%;
            margin-bottom: 35px;
        }
        .meta-box {
            background-color: #1a1216;
            border: 1px solid rgba(236, 227, 214, 0.08);
            padding: 16px 20px;
            vertical-align: top;
        }
        .meta-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #c6a15b;
            margin-bottom: 8px;
            font-weight: bold;
        }
        .meta-value {
            font-size: 12px;
            color: #ece3d6;
        }
        .meta-muted {
            font-size: 11px;
            color: #9e8e88;
            margin-top: 3px;
        }

        /* Items Table */
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .table-items th {
            background-color: #180f13;
            color: #c6a15b;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: bold;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 1px solid rgba(198, 161, 91, 0.25);
        }
        .table-items td {
            padding: 14px 14px;
            border-bottom: 1px solid rgba(236, 227, 214, 0.06);
            color: #ece3d6;
            font-size: 12px;
        }
        .table-items .col-num {
            width: 25px;
            color: #9e8e88;
        }
        .table-items .col-qty {
            width: 50px;
            text-align: center;
        }
        .table-items .col-price {
            width: 90px;
            text-align: right;
        }
        .table-items .col-total {
            width: 100px;
            text-align: right;
            color: #c6a15b;
        }

        /* Totals */
        .totals-table {
            width: 45%;
            float: right;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .totals-table td {
            padding: 7px 0;
            font-size: 12px;
        }
        .totals-table .label {
            color: #9e8e88;
        }
        .totals-table .val {
            text-align: right;
            color: #ece3d6;
        }
        .totals-table .grand-total td {
            padding-top: 14px;
            border-top: 1px solid rgba(198, 161, 91, 0.3);
            font-size: 16px;
            color: #c6a15b;
            font-weight: bold;
        }

        .clear {
            clear: both;
        }

        /* Privacy & Discretion Card */
        .discretion-badge {
            background-color: #160e12;
            border: 1px solid rgba(198, 161, 91, 0.2);
            padding: 15px 20px;
            margin-top: 20px;
            margin-bottom: 25px;
        }
        .discretion-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #c6a15b;
            margin-bottom: 4px;
            font-weight: bold;
        }
        .discretion-text {
            font-size: 11px;
            color: #9e8e88;
            line-height: 1.4;
        }

        /* Footer */
        .footer {
            border-top: 1px solid rgba(236, 227, 214, 0.08);
            padding-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #9e8e88;
            letter-spacing: 0.5px;
        }
        .footer-gold {
            color: #c6a15b;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header">
        <tr>
            <td style="vertical-align: middle;">
                <div class="brand">VELOUR</div>
                <div class="brand-sub">Atelier of Sensations & Quiet Luxury</div>
            </td>
            <td style="vertical-align: middle;">
                <div class="doc-title">Receipt & Invoice</div>
                <div class="doc-meta">#{{ $order->number }} · {{ $order->created_at ? $order->created_at->format('M d, Y') : date('M d, Y') }}</div>
            </td>
        </tr>
    </table>

    <!-- Meta Information -->
    <table class="meta-grid" cellspacing="0" cellpadding="0">
        <tr>
            <td class="meta-box" style="width: 48%;">
                <div class="meta-label">Recipient & Destination</div>
                <div class="meta-value"><strong>{{ $order->shipping_address['name'] ?? 'Private Client' }}</strong></div>
                <div class="meta-muted">{{ $order->shipping_address['line1'] ?? '' }}</div>
                @if(!empty($order->shipping_address['line2']))
                    <div class="meta-muted">{{ $order->shipping_address['line2'] }}</div>
                @endif
                <div class="meta-muted">
                    {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['postcode'] ?? '' }}
                </div>
                <div class="meta-muted">{{ $order->shipping_address['country'] ?? '' }}</div>
                <div class="meta-muted" style="margin-top: 6px;">{{ $order->email }}</div>
            </td>
            <td style="width: 4%;"></td>
            <td class="meta-box" style="width: 48%;">
                <div class="meta-label">Order Logistics</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #9e8e88; font-size: 11px; padding: 2px 0;">Order Status:</td>
                        <td style="text-align: right; color: #ece3d6; font-size: 11px;">{{ $order->status->label() }}</td>
                    </tr>
                    <tr>
                        <td style="color: #9e8e88; font-size: 11px; padding: 2px 0;">Dispatch Method:</td>
                        <td style="text-align: right; color: #ece3d6; font-size: 11px;">Discreet Courier</td>
                    </tr>
                    <tr>
                        <td style="color: #9e8e88; font-size: 11px; padding: 2px 0;">Packaging:</td>
                        <td style="text-align: right; color: #c6a15b; font-size: 11px;">
                            {{ $order->is_discreet_packaging ? 'Unmarked Box' : 'Standard' }}
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #9e8e88; font-size: 11px; padding: 2px 0;">Bank Statement:</td>
                        <td style="text-align: right; color: #ece3d6; font-size: 11px;">{{ $order->statement_descriptor }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Line Items Table -->
    <table class="table-items">
        <thead>
            <tr>
                <th class="col-num">#</th>
                <th>Item & Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Unit Price</th>
                <th class="col-total">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $index => $item)
                <tr>
                    <td class="col-num">{{ $index + 1 }}</td>
                    <td>
                        <div style="font-weight: 500; color: #ece3d6;">{{ $item->product_name_snapshot }}</div>
                        <div style="font-size: 10px; color: #9e8e88; margin-top: 2px;">
                            Variant: {{ $item->variant_name_snapshot }} · SKU: {{ $item->sku_snapshot }}
                        </div>
                    </td>
                    <td class="col-qty">{{ $item->qty }}</td>
                    <td class="col-price">{{ number_format($item->unit_price_cents / 100, 2) }} {{ $order->currency }}</td>
                    <td class="col-total">{{ number_format($item->total_cents / 100, 2) }} {{ $order->currency }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals Table -->
    <table class="totals-table">
        <tr>
            <td class="label">Subtotal:</td>
            <td class="val">{{ number_format($order->subtotal_cents / 100, 2) }} {{ $order->currency }}</td>
        </tr>
        <tr>
            <td class="label">Discreet Shipping:</td>
            <td class="val">
                @if($order->shipping_cents === 0)
                    <span style="color: #c6a15b;">Complimentary</span>
                @else
                    {{ number_format($order->shipping_cents / 100, 2) }} {{ $order->currency }}
                @endif
            </td>
        </tr>
        <tr class="grand-total">
            <td style="color: #ece3d6;">Grand Total:</td>
            <td class="val">{{ number_format($order->total_cents / 100, 2) }} {{ $order->currency }}</td>
        </tr>
    </table>

    <div class="clear"></div>

    <!-- Discretion Guarantee -->
    <div class="discretion-badge">
        <div class="discretion-title">The Discretion Covenant</div>
        <div class="discretion-text">
            Your privacy is absolute. This shipment was dispatched in an unmarked, tamper-evident container with no external indication of contents. Billed on your financial statement as <strong>{{ $order->statement_descriptor }}</strong>.
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <span class="footer-gold">VELOUR</span> · velour-retail.com · info@velour-retail.com
        <br>
        <span style="font-size: 9px; color: #736762;">All items covered by our 14-Day Hygiene & Craftsmanship Guarantee.</span>
    </div>

</body>
</html>
