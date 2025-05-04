<?php

namespace Database\Factories;

use App\Models\SSH;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SSH>
 */
class SSHFactory extends Factory
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
            'ip' => $this->faker->ipv4(),
            'last_used_at' => $this->faker->dateTime(),
            'password' => $this->faker->password(),
        ];
    }
}
