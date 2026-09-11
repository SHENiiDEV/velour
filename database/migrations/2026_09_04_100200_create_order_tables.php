<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number')->unique();              // VLR-2026-000123
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('status')->default('pending');    // OrderStatus
            $table->char('currency', 3)->default('EUR');

            $table->unsignedInteger('subtotal_cents')->default(0);
            $table->unsignedInteger('discount_cents')->default(0);
            $table->unsignedInteger('shipping_cents')->default(0);
            $table->unsignedInteger('tax_cents')->default(0);
            $table->unsignedInteger('total_cents')->default(0);

            // Приватность — поля заказа, а не галочка в интерфейсе.
            $table->boolean('is_discreet_packaging')->default(true);
            $table->string('statement_descriptor')->nullable();   // нейтральная строка в выписке

            $table->json('shipping_address');                 // снимок адреса
            $table->json('billing_address')->nullable();
            $table->text('notes')->nullable();

            $table->timestamp('placed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('email');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained()->nullOnDelete();

            // Снимки: товар может быть переименован или удалён — заказ остаётся читаемым.
            $table->string('product_name_snapshot');
            $table->string('variant_name_snapshot')->nullable();
            $table->string('sku_snapshot');
            $table->unsignedInteger('qty');
            $table->unsignedInteger('unit_price_cents');
            $table->unsignedInteger('total_cents');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider');                       // ccbill | segpay | manual …
            $table->string('provider_ref')->nullable();       // id транзакции на стороне провайдера
            $table->string('status')->default('initiated');   // PaymentStatus
            $table->unsignedInteger('amount_cents');
            $table->char('currency', 3)->default('EUR');
            $table->json('payload')->nullable();              // ответ/webhook, без данных карты
            $table->timestamps();

            $table->index(['provider', 'provider_ref']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
