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
     * VLR-7K3Q9P — без намёка на содержимое и без последовательного счётчика:
     * по номеру нельзя оценить объём продаж (аудит, М11). Алфавит без 0/O/1/I/L,
     * чтобы номер легко продиктовать. Уникальный индекс в БД — последняя линия обороны.
     */
    public static function nextNumber(): string
    {
        $alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $number = "VLR-{$code}";
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
