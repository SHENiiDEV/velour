<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<\App\Models\Variant> */
class VariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => strtoupper(Str::random(8)),
            'name' => Str::title($this->faker->colorName()),
            'options' => ['color' => $this->faker->safeColorName()],
            'price_cents' => null,
            'stock' => 10,
            'is_default' => true,
            'is_active' => true,
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
