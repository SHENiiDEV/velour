<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Cart extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Cart $cart) {
            $cart->token ??= (string) Str::uuid();
            $cart->expires_at ??= now()->addDays(30);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function subtotalCents(): int
    {
        return (int) $this->items->sum(fn (CartItem $item) => $item->totalCents());
    }

    public function itemCount(): int
    {
        return (int) $this->items->sum('qty');
    }
}
