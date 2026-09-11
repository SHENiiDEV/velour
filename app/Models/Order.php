<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'is_discreet_packaging' => 'boolean',
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'shipping_cents' => 'integer',
            'tax_cents' => 'integer',
            'total_cents' => 'integer',
            'placed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'number';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * VLR-2026-000123 — без намёка на содержимое, годится и для наклейки на коробке.
     * Счётчик не атомарен, поэтому при гонке двух заказов просто берём следующий
     * свободный номер (уникальный индекс в БД — последняя линия обороны).
     */
    public static function nextNumber(): string
    {
        $year = now()->year;
        $seq = static::whereYear('created_at', $year)->count() + 1;

        do {
            $number = sprintf('VLR-%d-%06d', $year, $seq++);
        } while (static::where('number', $number)->exists());

        return $number;
    }

    public function markPaid(): void
    {
        $this->forceFill([
            'status' => OrderStatus::Paid,
            'paid_at' => now(),
        ])->save();
    }
}
