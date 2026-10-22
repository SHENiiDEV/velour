<?php

namespace App\Console\Commands;

use App\Mail\OrderConfirmationMail;
use App\Mail\WelcomeMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Проверка SMTP (PrivateEmail) без оформления заказа:
 *   php artisan velour:mail-test you@example.com
 *   php artisan velour:mail-test you@example.com --order=VLR-0001
 * Отправка синхронная (send), минуя очередь — ошибка SMTP видна сразу.
 */
class MailTestCommand extends Command
{
    protected $signature = 'velour:mail-test {to} {--order= : номер заказа для письма с инвойсом}';

    protected $description = 'Отправить тестовые письма (welcome и, опционально, подтверждение заказа с PDF)';

    public function handle(): int
    {
        $to = $this->argument('to');

        $user = User::query()->first() ?? new User(['name' => 'Test Client', 'email' => $to]);
        Mail::to($to)->send(new WelcomeMail($user));
        $this->info("Welcome → {$to}");

        if ($number = $this->option('order')) {
            $order = Order::where('number', $number)->firstOrFail();
            Mail::to($to)->send(new OrderConfirmationMail($order));
            $this->info("Order #{$number} + PDF → {$to}");
        }

        return self::SUCCESS;
    }
}
