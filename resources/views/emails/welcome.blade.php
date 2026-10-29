<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Welcome to {{ config('app.name', 'VELOUR') }}</title>
</head>
<body style="margin:0; padding:0; background-color:#100a0c; color:#ece3d6; -webkit-font-smoothing:antialiased;">
    {{-- Preheader: строка превью в почтовом клиенте --}}
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#100a0c;">
        Your private account is open. Everything here is kept between us.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#100a0c; border-collapse:collapse;">
        <tr>
            <td align="center" style="padding:40px 15px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#1a1216; border:1px solid rgba(198,161,91,0.25); border-radius:4px; border-collapse:separate; overflow:hidden;">

                    {{-- Hero --}}
                    <tr>
                        <td align="center" style="padding:56px 36px 44px; background-color:#1a1216; background-image:radial-gradient(ellipse at 50% 120%, rgba(194,77,89,0.35) 0%, rgba(78,18,36,0.45) 40%, rgba(26,18,22,0) 75%);">
                            <div style="font-family:'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size:30px; letter-spacing:6px; font-weight:300; color:#ece3d6;">VELOUR</div>
                            <div style="width:36px; height:1px; background-color:#c6a15b; margin:18px auto 30px; line-height:1px; font-size:1px;">&nbsp;</div>
                            <h1 style="margin:0; font-family:'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size:40px; line-height:1.15; font-weight:300; font-style:italic; color:#ece3d6;">
                                Welcome{{ $firstName !== '' ? ', '.$firstName : '' }}.
                            </h1>
                            <p style="margin:16px 0 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:15px; line-height:1.7; font-weight:300; color:#9e8e88; max-width:430px;">
                                Your private account is now open — a quiet room of your own, where every selection, order and preference is kept with the same discretion as everything we send.
                            </p>
                        </td>
                    </tr>

                    {{-- Promises --}}
                    <tr>
                        <td style="padding:8px 40px 8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="padding:20px 0; border-bottom:1px solid rgba(236,227,214,0.07);">
                                        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:21px; color:#e6cb88; font-weight:400;">Discreet, always</div>
                                        <div style="margin-top:6px; font-size:13px; line-height:1.65; color:#9e8e88;">
                                            Plain, unmarked packaging. Your statement shows only <span style="color:#ece3d6;">{{ $descriptor }}</span> — never what you bought. No advertising trackers following you around the internet.
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 0; border-bottom:1px solid rgba(236,227,214,0.07);">
                                        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:21px; color:#e6cb88; font-weight:400;">Honest materials</div>
                                        <div style="margin-top:6px; font-size:13px; line-height:1.65; color:#9e8e88;">
                                            Every piece lists exactly what touches your skin — body-safe silicone, glass, steel — and how to care for it.
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 0;">
                                        <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:21px; color:#e6cb88; font-weight:400;">Your private archive</div>
                                        <div style="margin-top:6px; font-size:13px; line-height:1.65; color:#9e8e88;">
                                            Orders and invoices gathered in one place, visible only to you.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- CTA --}}
                    <tr>
                        <td align="center" style="padding:24px 40px 48px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="background-color:#c6a15b; border-radius:2px;">
                                        <a href="{{ $catalogUrl }}" style="display:inline-block; padding:15px 34px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:14px; letter-spacing:0.5px; font-weight:500; color:#100a0c; text-decoration:none;">Enter the collection</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:18px 0 0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:12px; color:#9e8e88;">
                                or visit <a href="{{ $accountUrl }}" style="color:#c6a15b; text-decoration:none;">your account</a>
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td align="center" style="padding:26px 36px; border-top:1px solid rgba(236,227,214,0.08); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size:11px; line-height:1.7; color:#736762;">
                            You received this because an account was created with this address.
                            Not you? Simply reply and we will close it.<br><br>
                            {{ $company['name'] }}@if($company['reg_number']) · Reg. No. {{ $company['reg_number'] }}@endif<br>
                            @if($company['address']){{ $company['address'] }}<br>@endif
                            <a href="mailto:{{ $company['email'] }}" style="color:#c6a15b; text-decoration:none;">{{ $company['email'] }}</a><br>
                            <span style="color:#574c48;">Strictly for adults 18+. No promotional emails unless you ask for them.</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
