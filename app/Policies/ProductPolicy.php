<?php

namespace App\Policies;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /** Витрина показывает только опубликованное; черновики — админам. */
    public function view(?User $user, Product $product): bool
    {
        if ($product->status === ProductStatus::Live
            && ($product->published_at === null || $product->published_at->isPast())) {
            return true;
        }

        return (bool) $user?->is_admin;
    }

    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, Product $product): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->is_admin;
    }
}
