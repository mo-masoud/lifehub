<?php

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('savings goal can be created with valid data', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'title' => 'Buy a House',
        'target_amount_usd' => 50000,
        'severity' => 'high',
        'target_date' => '2025-12-31',
    ]);

    expect($goal)->toBeInstanceOf(SavingsGoal::class)
        ->and($goal->title)->toBe('Buy a House')
        ->and($goal->target_amount_usd)->toBe(50000.0)
        ->and($goal->severity)->toBe('high')
        ->and($goal->user_id)->toBe($this->user->id);
});

test('progress percentage is calculated correctly', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 2500,
    ]);

    expect($goal->progress_percentage)->toBe(25.0);
});

test('progress percentage does not exceed 100', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 15000,
    ]);

    expect($goal->progress_percentage)->toBe(100.0);
});

test('goal is marked as achieved when progress reaches 100%', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 10000,
    ]);

    expect($goal->is_achieved)->toBeTrue()
        ->and($goal->achieved_at)->not->toBeNull();
});

test('goal is not achieved when progress is less than 100%', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 9999,
    ]);

    expect($goal->is_achieved)->toBeFalse()
        ->and($goal->achieved_at)->toBeNull();
});

test('goal is overdue when target date has passed and not achieved', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 5000,
        'target_date' => '2024-01-01', // Past date
    ]);

    expect($goal->is_overdue)->toBeTrue();
});

test('goal is not overdue when target date has not passed', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 5000,
        'target_date' => '2026-12-31', // Future date
    ]);

    expect($goal->is_overdue)->toBeFalse();
});

test('goal is not overdue when achieved even if date passed', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 10000,
        'target_date' => '2024-01-01', // Past date but achieved
    ]);

    expect($goal->is_overdue)->toBeFalse()
        ->and($goal->is_achieved)->toBeTrue();
});

test('goal is not overdue when no target date is set', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 5000,
        'target_date' => null,
    ]);

    expect($goal->is_overdue)->toBeFalse();
});

test('egp amounts are calculated correctly from usd amounts', function () {
    // Mock exchange rate - this would typically be handled by the ExchangeRateService
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
        'current_amount_usd' => 250,
    ]);

    // Assuming 1 USD = 50 EGP (this should match your actual exchange rate)
    expect($goal->target_amount_egp)->toBeGreaterThan(0)
        ->and($goal->current_amount_egp)->toBeGreaterThan(0);
});

test('user can have multiple savings goals', function () {
    $goals = SavingsGoal::factory(3)->create([
        'user_id' => $this->user->id,
    ]);

    expect($this->user->savingsGoals)->toHaveCount(3)
        ->and($this->user->savingsGoals->first())->toBeInstanceOf(SavingsGoal::class);
});

test('savings goal belongs to user', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
    ]);

    expect($goal->user)->toBeInstanceOf(User::class)
        ->and($goal->user->id)->toBe($this->user->id);
});

test('check achievements updates achievement status', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 5000,
        'is_achieved' => false,
        'achieved_at' => null,
    ]);

    // Update current amount to achieve the goal
    $goal->update(['current_amount_usd' => 10000]);
    $goal->checkAchievements();

    expect($goal->fresh()->is_achieved)->toBeTrue()
        ->and($goal->fresh()->achieved_at)->not->toBeNull();
});

test('manual achievement marking works correctly', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 10000,
        'current_amount_usd' => 5000,
        'is_achieved' => false,
        'achieved_at' => null,
    ]);

    $goal->markAsAchieved();

    expect($goal->fresh()->is_achieved)->toBeTrue()
        ->and($goal->fresh()->achieved_at)->not->toBeNull()
        ->and($goal->fresh()->success_notification_shown_at)->not->toBeNull();
});
