<?php

namespace Database\Factories;

use App\Models\Password;
use App\Models\PasswordAuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PasswordAuditLog>
 */
class PasswordAuditLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = PasswordAuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = ['created', 'updated', 'deleted', 'copied', 'viewed', 'bulk_deleted', 'moved_to_folder', 'removed_from_folder'];
        $contexts = ['web', 'api', 'cli'];

        return [
            'password_id' => Password::factory(),
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement($actions),
            'ip_address' => $this->faker->optional(0.8)->ipv4(),
            'context' => $this->faker->randomElement($contexts),
            'metadata' => $this->faker->optional(0.3)->passthrough([
                'user_agent' => $this->faker->userAgent(),
                'additional_info' => $this->faker->sentence(),
            ]),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Create an audit log for a specific action.
     */
    public function withAction(string $action): static
    {
        return $this->state(function (array $attributes) use ($action) {
            return [
                'action' => $action,
            ];
        });
    }

    /**
     * Create an audit log for a specific context.
     */
    public function withContext(string $context): static
    {
        return $this->state(function (array $attributes) use ($context) {
            return [
                'context' => $context,
            ];
        });
    }

    /**
     * Create an audit log with specific metadata.
     */
    public function withMetadata(array $metadata): static
    {
        return $this->state(function (array $attributes) use ($metadata) {
            return [
                'metadata' => $metadata,
            ];
        });
    }

    /**
     * Create an audit log for a recent action.
     */
    public function recent(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'created_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            ];
        });
    }
}
