<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SavingsGoal>
 */
class SavingsGoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $targetAmount = $this->faker->randomFloat(2, 1000, 100000);
        $targetDate = $this->faker->optional(0.7)->dateTimeBetween('now', '+2 years');

        return [
            'user_id' => \App\Models\User::factory(),
            'title' => $this->faker->randomElement([
                'Emergency Fund',
                'Buy a House',
                'New Car',
                'Vacation Trip',
                'Investment Portfolio',
                'Wedding Fund',
                'Retirement Savings',
                'Home Renovation',
                'Education Fund',
                'Business Startup',
            ]),
            'target_amount_usd' => $targetAmount,
            'severity' => $this->faker->randomElement(['low', 'medium', 'high', 'very-high']),
            'target_date' => $targetDate?->format('Y-m-d'),
            'is_achieved' => false,
            'achieved_at' => null,
            'success_notification_dismissed' => false,
            'success_notification_shown_at' => null,
        ];
    }

    /**
     * Indicate that the goal is achieved.
     */
    public function achieved(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_achieved' => true,
            'achieved_at' => now(),
            'success_notification_shown_at' => now(),
        ]);
    }

    /**
     * Indicate that the goal is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn(array $attributes) => [
            'target_date' => $this->faker->dateTimeBetween('-1 year', '-1 day')->format('Y-m-d'),
            'is_achieved' => false,
            'achieved_at' => null,
        ]);
    }

    /**
     * Indicate that the goal has low priority.
     */
    public function lowPriority(): static
    {
        return $this->state(fn(array $attributes) => [
            'severity' => 'low',
        ]);
    }

    /**
     * Indicate that the goal has high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn(array $attributes) => [
            'severity' => 'very-high',
        ]);
    }

    /**
     * Indicate that the goal is in progress (not achieved, not overdue).
     */
    public function inProgress(): static
    {
        return $this->state(fn(array $attributes) => [
            'target_date' => $this->faker->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d'),
            'is_achieved' => false,
            'achieved_at' => null,
        ]);
    }
}
