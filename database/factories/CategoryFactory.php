<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<\App\Models\Category> */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->word();

        return [
            'slug' => Str::slug($name).'-'.Str::random(4),
            'name' => Str::title($name),
            'tagline' => $this->faker->sentence(3),
            'is_visible' => true,
            'position' => 0,
        ];
    }
}
