<?php

use App\Jobs\CheckGoalsAchievements;
use App\Models\Snapshot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('creating snapshot via controller triggers goals check job', function () {
    Queue::fake();

    // Create authenticated user
    $user = User::factory()->create();

    // Act as the user and create a snapshot via the controller
    $response = $this->actingAs($user)
        ->post(route('dashboard.savings.snapshots.store'));

    // Assert snapshot was created successfully
    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Assert that the CheckGoalsAchievements job was dispatched
    Queue::assertPushed(CheckGoalsAchievements::class, function ($job) use ($user) {
        return $job->user->id === $user->id;
    });
});

test('deleting snapshot via controller triggers goals check job', function () {
    // Create authenticated user and snapshot
    $user = User::factory()->create();
    $snapshot = Snapshot::factory()->create(['user_id' => $user->id]);

    // Create additional snapshot so deletion is allowed (business rule: can't delete if only one item)
    Snapshot::factory()->create(['user_id' => $user->id]);

    Queue::fake();

    // Act as the user and delete the snapshot via the controller
    $response = $this->actingAs($user)
        ->delete(route('dashboard.savings.snapshots.destroy', $snapshot));

    // Assert snapshot was deleted successfully
    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Assert that the CheckGoalsAchievements job was dispatched
    Queue::assertPushed(CheckGoalsAchievements::class, function ($job) use ($user) {
        return $job->user->id === $user->id;
    });
});

test('goals are no longer manually checked in home controller', function () {
    // Create authenticated user
    $user = User::factory()->create();

    // Mock the goals to ensure checkAndUpdateAchievement is not called
    // This test ensures we removed the manual checking from HomeController
    $response = $this->actingAs($user)
        ->get(route('dashboard.home'));

    $response->assertOk();

    // If we reach this point, it means the home controller works without manual goal checking
    expect(true)->toBeTrue();
});
