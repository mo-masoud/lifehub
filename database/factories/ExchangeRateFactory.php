<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExchangeRate>
 */
class ExchangeRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'currency_code' => 'USD',
            'rate' => $this->faker->randomFloat(2, 30, 60),
            'source' => 'api',
            'fetched_at' => now(),
            'expires_at' => now()->addHours(24),
            'is_active' => true,
            'api_response' => [
                'base' => 'USD',
                'rates' => ['EGP' => $this->faker->randomFloat(2, 30, 60)]
            ],
        ];
    }
}
