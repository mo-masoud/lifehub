<?php

namespace Database\Factories;

use App\Enums\PasswordTypes;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Password>
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
            'user_id' => User::factory()->create()->id,
            'type' => $this->faker->randomElement(PasswordTypes::cases()),
            'name' => $this->faker->unique()->word(),
            'username' => $this->faker->userName(),
            'password' => $this->faker->password(),
            'url' => $this->faker->url(),
            'notes' => $this->faker->optional()->paragraph(),
            'folder_id' => $this->faker->optional()->passthrough(Folder::factory()->create()->id),
            'copied' => $this->faker->numberBetween(0, 100),
            'last_used_at' => $this->faker->optional()->dateTimeBetween('-1 year', 'now'),
            'expires_at' => $this->faker->optional()->dateTimeBetween('-1 year', '+1 year'),
        ];
    }
}
