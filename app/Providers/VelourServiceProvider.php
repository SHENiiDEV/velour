<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Product;
use App\Observers\ProductObserver;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Services\Payments\PaymentManager;
use App\Mail\WelcomeMail;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class VelourServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentManager::class);
    }

    public function boot(): void
    {
        Product::observe(ProductObserver::class);

        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);

        // Гостевая корзина переезжает к пользователю при входе.
        Event::listen(Login::class, function (Login $event) {
            app(\App\Services\CartService::class)->mergeGuestCartInto($event->user->getAuthIdentifier());
        });

        // Приветственное письмо. Через очередь — регистрация не ждёт SMTP.
        Event::listen(Registered::class, function (Registered $event) {
            try {
                Mail::to($event->user->email)->queue(new WelcomeMail($event->user));
            } catch (\Throwable $e) {
                report($e);
            }
        });
    }
}
