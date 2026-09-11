<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<\App\Models\Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = Str::title($this->faker->unique()->word());

        return [
            'category_id' => Category::factory(),
            'slug' => Str::slug($name).'-'.Str::random(5),
            'name' => $name,
            'tagline' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'materials' => ['Medical-Grade Silicone'],
            'attributes' => ['firmness' => 3, 'texture' => 'silk'],
            'price_cents' => $this->faker->numberBetween(1900, 19900),
            'currency' => 'EUR',
            'status' => ProductStatus::Live,
            'is_body_safe' => true,
            'published_at' => now()->subDay(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ProductStatus::Draft, 'published_at' => null]);
    }
}
