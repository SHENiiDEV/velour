@php($money = fn (int $cents) => number_format($cents / 100, 2).' '.$order->currency)
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Order {{ $order->number }} cancelled</title>
</head>
<body style="margin:0; padding:0; background-color:#100a0c; color:#ece3d6; -webkit-font-smoothing:antialiased;">
    {{-- Preheader --}}
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#100a0c;">
        Order {{ $order->number }} has been cancelled. {{ $wasPaid ? 'Your refund is on its way.' : 'No payment has been taken.' }}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#100a0c; border-collapse:collapse;">
        <tr>
            <td align="center" style="padding:40px 15px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#1a1216; border:1px solid rgba(198,161,91,0.25); border-radius:4px; border-collapse:separate; overflow:hidden;">

                    {{-- Hero --}}
                    <tr>
                        <td align="center" style="padding:52px 36px 40px; background-color:#1a1216; background-image:radial-gradient(ellipse at 50% 120%, rgba(78,18,36,0.55) 0%, rgba(26,18,22,0) 70%);">
                            <div style="font-family:'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size:30px; letter-spacing:6px; font-weight:300; color:#ece3d6;">VELOUR</div>
                            <div style="width:36px; height:1px; background-color:#c6a15b; margin:18px auto 28px; line-height:1px; font-size:1px;">&nbsp;</div>
                            <h1 style="margin:0; font-family:'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size:36px; line-height:1.15; font-weight:300; font-style:italic; color:#ece3d6;">
                                Your order has been cancelled{{ $firstName !== '' ? ', '.$firstName : '' }}.
                            </h1>
                            <p style="margin:16px auto 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:15px; line-height:1.7; color:#b3a39c; max-width:440px;">
                                Order <span style="color:#e6cb88;">{{ $order->number }}</span> will not be sent.
                                @if($wasPaid)
                                    We are refunding <span style="color:#ece3d6;">{{ $money($order->total_cents) }}</span> to your original payment method — it usually arrives within 5–10 business days, and never later than 14 days.
                                @else
                                    No payment has been taken, so there is nothing more you need to do.
                                @endif
                            </p>
                        </td>
                    </tr>

                    @if($order->cancellation_reason)
                        <tr>
                            <td style="padding:0 40px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="border-left:2px solid #c6a15b; background-color:rgba(78,18,36,0.2); padding:14px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; color:#d9cdc4;">
                                            {{ $order->cancellation_reason }}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    @endif

                    {{-- What was in the order --}}
                    <tr>
                        <td style="padding:24px 40px 8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                            <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:21px; color:#e6cb88;">Cancelled order</div>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:10px;">
                                @foreach($order->items as $item)
                                    <tr>
                                        <td style="padding:12px 0; border-bottom:1px solid rgba(236,227,214,0.08); font-size:13px; color:#ece3d6;">
                                            {{ $item->product_name_snapshot }}
                                            <span style="color:#9e8e88;">
                                                @if($item->variant_name_snapshot && ! in_array(strtolower($item->variant_name_snapshot), ['default title', 'standard'], true))
                                                    · {{ $item->variant_name_snapshot }}
                                                @endif
                                                × {{ $item->qty }}
                                            </span>
                                        </td>
                                        <td align="right" style="padding:12px 0; border-bottom:1px solid rgba(236,227,214,0.08); font-size:13px; color:#9e8e88; white-space:nowrap;">
                                            {{ $money($item->total_cents) }}
                                        </td>
                                    </tr>
                                @endforeach
                                <tr>
                                    <td style="padding:14px 0 0; font-size:14px; color:#ece3d6;">Total</td>
                                    <td align="right" style="padding:14px 0 0; font-size:14px; color:#e6cb88; white-space:nowrap;">{{ $money($order->total_cents) }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- CTA --}}
                    <tr>
                        <td align="center" style="padding:32px 40px 44px;">
                            <p style="margin:0 0 22px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:14px; line-height:1.7; color:#b3a39c;">
                                Changed your mind, or did not ask for this? Simply reply to this email and we will put it right.
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="background-color:#c6a15b; border-radius:2px;">
                                        <a href="{{ $catalogUrl }}" style="display:inline-block; padding:14px 32px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:14px; letter-spacing:0.5px; font-weight:500; color:#100a0c; text-decoration:none;">Back to the collection</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td align="center" style="padding:26px 36px; border-top:1px solid rgba(236,227,214,0.08); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:12px; line-height:1.7; color:#8a7c76;">
                            {{ $company['name'] }}@if($company['reg_number']) · Reg. No. {{ $company['reg_number'] }}@endif<br>
                            @if($company['address']){{ $company['address'] }}<br>@endif
                            <a href="mailto:{{ $company['email'] }}" style="color:#c6a15b; text-decoration:none;">{{ $company['email'] }}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
