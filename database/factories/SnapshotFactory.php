<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Snapshot>
 */
class SnapshotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'usd_rate' => fake()->randomFloat(2, 45, 55),
            'gold24_price' => fake()->randomFloat(2, 2000, 3000),
            'gold21_price' => fake()->randomFloat(2, 1800, 2700),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
