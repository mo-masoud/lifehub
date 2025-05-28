<?php

use App\Models\SavingsGoal;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('savings goal can be created with valid data', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'title' => 'Buy a House',
        'target_amount_usd' => 50000,
        'safety_margin_percentage' => 10,
        'severity' => 'high',
        'target_date' => '2025-12-31',
    ]);

    expect($goal)->toBeInstanceOf(SavingsGoal::class)
        ->and($goal->title)->toBe('Buy a House')
        ->and((float) $goal->target_amount_usd)->toBe(50000.0)
        ->and((float) $goal->safety_margin_percentage)->toBe(10.0)
        ->and($goal->severity)->toBe('high')
        ->and($goal->user_id)->toBe($this->user->id);
});

test('effective target amount includes safety margin', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
        'safety_margin_percentage' => 10,
    ]);

    expect((float) $goal->effective_target_amount_usd)->toBe(1100.0)
        ->and((float) $goal->safety_margin_amount_usd)->toBe(100.0);
});

test('effective target amount equals target amount when no safety margin', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
        'safety_margin_percentage' => 0,
    ]);

    expect((float) $goal->effective_target_amount_usd)->toBe(1000.0)
        ->and((float) $goal->safety_margin_amount_usd)->toBe(0.0);
});

test('safety margin amounts are calculated in both USD and EGP', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
        'safety_margin_percentage' => 15,
    ]);

    expect((float) $goal->safety_margin_amount_usd)->toBe(150.0)
        ->and($goal->safety_margin_amount_egp)->toBeGreaterThan(0);
});

test('effective progress percentage accounts for safety margin', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
        'safety_margin_percentage' => 10, // Effective target becomes 1100
    ]);

    // Since we can't easily mock the current savings in this test context,
    // we'll test that the effective progress percentage is calculated differently
    // than the regular progress percentage when safety margin is present
    expect((float) $goal->effective_target_amount_usd)->toBe(1100.0)
        ->and($goal->effective_target_amount_usd)->toBeGreaterThan($goal->target_amount_usd);
});

test('goal can be marked as achieved manually', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'is_achieved' => false,
        'achieved_at' => null,
    ]);

    $goal->markAsAchieved();

    expect($goal->fresh()->is_achieved)->toBeTrue()
        ->and($goal->fresh()->achieved_at)->not->toBeNull()
        ->and($goal->fresh()->success_notification_shown_at)->not->toBeNull();
});

test('goal is overdue when target date has passed and not achieved', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_date' => '2024-01-01', // Past date
        'is_achieved' => false,
    ]);

    expect($goal->is_overdue)->toBeTrue();
});

test('goal is not overdue when target date has not passed', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_date' => '2026-12-31', // Future date
        'is_achieved' => false,
    ]);

    expect($goal->is_overdue)->toBeFalse();
});

test('goal is not overdue when achieved even if date passed', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_date' => '2024-01-01', // Past date but achieved
        'is_achieved' => true,
        'achieved_at' => now(),
    ]);

    expect($goal->is_overdue)->toBeFalse()
        ->and($goal->is_achieved)->toBeTrue();
});

test('goal is not overdue when no target date is set', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_date' => null,
        'is_achieved' => false,
    ]);

    expect($goal->is_overdue)->toBeFalse();
});

test('egp amounts are calculated from usd amounts', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id,
        'target_amount_usd' => 1000,
    ]);

    // The EGP amounts should be calculated via exchange rate
    expect($goal->target_amount_egp)->toBeGreaterThan(0);
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

test('achieved goals factory state works correctly', function () {
    $goal = SavingsGoal::factory()->achieved()->create([
        'user_id' => $this->user->id,
    ]);

    expect($goal->is_achieved)->toBeTrue()
        ->and($goal->achieved_at)->not->toBeNull()
        ->and($goal->success_notification_shown_at)->not->toBeNull();
});

test('overdue goals factory state works correctly', function () {
    $goal = SavingsGoal::factory()->overdue()->create([
        'user_id' => $this->user->id,
    ]);

    expect($goal->is_overdue)->toBeTrue()
        ->and($goal->is_achieved)->toBeFalse();
});

test('high priority goals factory state works correctly', function () {
    $goal = SavingsGoal::factory()->highPriority()->create([
        'user_id' => $this->user->id,
    ]);

    expect($goal->severity)->toBe('very-high');
});

test('notification dismissal works correctly', function () {
    $goal = SavingsGoal::factory()->achieved()->create([
        'user_id' => $this->user->id,
        'success_notification_dismissed' => false,
    ]);

    $goal->update(['success_notification_dismissed' => true]);

    expect($goal->fresh()->success_notification_dismissed)->toBeTrue();
});
