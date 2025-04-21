<?php

namespace Database\Factories;

use App\Models\Password;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Password>
 */
class PasswordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::first()->id,
            'name' => $this->faker->word(),
            'username' => $this->faker->userName(),
            'url' => $this->faker->url(),
            'last_used_at' => $this->faker->dateTime(),
            'expiry_at' => $this->faker->dateTime(),
            'password' => $this->faker->password(),
        ];
    }
}
