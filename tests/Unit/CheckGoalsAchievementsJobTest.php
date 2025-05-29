<?php

use App\Jobs\CheckGoalsAchievements;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('job checks and updates achievements for all user goals', function () {
    // Create a user
    $user = User::factory()->create();

    // Create some savings goals for the user
    $goal1 = SavingsGoal::factory()->create([
        'user_id' => $user->id,
        'target_amount_usd' => 1000,
        'achieved_at' => null,
    ]);

    $goal2 = SavingsGoal::factory()->create([
        'user_id' => $user->id,
        'target_amount_usd' => 2000,
        'achieved_at' => null,
    ]);

    // Mock the checkAndUpdateAchievement method to track calls
    $goal1CheckCalled = false;
    $goal2CheckCalled = false;

    // Create partial mocks
    $goal1Mock = \Mockery::mock($goal1)->makePartial();
    $goal1Mock->shouldReceive('checkAndUpdateAchievement')
        ->once()
        ->andReturnUsing(function () use (&$goal1CheckCalled) {
            $goal1CheckCalled = true;
        });

    $goal2Mock = \Mockery::mock($goal2)->makePartial();
    $goal2Mock->shouldReceive('checkAndUpdateAchievement')
        ->once()
        ->andReturnUsing(function () use (&$goal2CheckCalled) {
            $goal2CheckCalled = true;
        });

    // Mock the user's savingsGoals relationship
    $userMock = \Mockery::mock($user)->makePartial();
    $userMock->shouldReceive('savingsGoals')
        ->once()
        ->andReturnSelf();
    $userMock->shouldReceive('get')
        ->once()
        ->andReturn(collect([$goal1Mock, $goal2Mock]));

    // Execute the job
    $job = new CheckGoalsAchievements($userMock);
    $job->handle();

    // Assert that checkAndUpdateAchievement was called for both goals
    expect($goal1CheckCalled)->toBeTrue();
    expect($goal2CheckCalled)->toBeTrue();
});

test('job handles user with no goals gracefully', function () {
    // Create a user with no goals
    $user = User::factory()->create();

    // Execute the job
    $job = new CheckGoalsAchievements($user);
    $job->handle();

    // Should not throw any exceptions
    expect(true)->toBeTrue();
});
